import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatPrice } from '../utils/formatPrice';
import { Badge, Button } from './Components';
import {
  ChevronRight, ChevronLeft, Clock, MapPin, MessageSquare,
  FolderOpen, Send, Loader2, ImagePlus, X, Phone, User as UserIcon,
  Package, ArrowRight, Coffee, Utensils, Beer, ShoppingBag, Scissors,
  Dumbbell, GraduationCap, Building, Monitor, Briefcase, MoreHorizontal
} from 'lucide-react';

interface MyConsultationsViewProps {
  onLoginRequired?: () => void;
  isGuestMode?: boolean;
}

interface ProjectItem {
  id: string;
  business_category: string;
  location_dong: string;
  store_size: number;
  estimated_total: number;
  status: string;
  current_step: number;
  pm_id: string | null;
  created_at: string;
  pm?: {
    id: string;
    name: string;
    phone: string;
    profile_image: string;
    introduction: string;
    rating: number;
  };
  has_pm_activity?: boolean;
}

interface Message {
  id: string;
  sender_type: 'USER' | 'PM' | 'SYSTEM';
  message: string;
  attachments?: { url: string; type: string; name: string }[];
  created_at: string;
}

const BUSINESS_LABELS: Record<string, { label: string; icon: any; emoji: string }> = {
  cafe: { label: '카페/디저트', icon: Coffee, emoji: '☕' },
  restaurant: { label: '음식점', icon: Utensils, emoji: '🍽️' },
  chicken: { label: '치킨/분식', icon: Utensils, emoji: '🍗' },
  pub: { label: '주점/바', icon: Beer, emoji: '🍺' },
  retail: { label: '소매/편의점', icon: ShoppingBag, emoji: '🏪' },
  beauty: { label: '미용/뷰티', icon: Scissors, emoji: '💇' },
  fitness: { label: '헬스/운동', icon: Dumbbell, emoji: '💪' },
  education: { label: '교육/학원', icon: GraduationCap, emoji: '📚' },
  pcroom: { label: 'PC방/오락시설', icon: Monitor, emoji: '🖥️' },
  hotel: { label: '호텔/숙박', icon: Building, emoji: '🏨' },
  office: { label: '사무실', icon: Briefcase, emoji: '🏢' },
  etc: { label: '기타', icon: MoreHorizontal, emoji: '📦' },
};

const STATUS_MAP: Record<string, { label: string; color: 'blue' | 'green' | 'red' | 'gray' | 'brand' }> = {
  DRAFT: { label: '임시저장', color: 'gray' },
  PENDING_PM: { label: 'PM 배정 대기', color: 'blue' },
  PM_ASSIGNED: { label: 'PM 배정 완료', color: 'brand' },
  IN_PROGRESS: { label: '진행중', color: 'blue' },
  PAYMENT_PENDING: { label: '결제 대기', color: 'red' },
  ACTIVE: { label: '활성', color: 'green' },
  POST_SERVICE: { label: '사후관리', color: 'brand' },
  COMPLETED: { label: '완료', color: 'green' },
  CANCELLED: { label: '취소', color: 'red' },
};

export const MyConsultationsView: React.FC<MyConsultationsViewProps> = ({ onLoginRequired, isGuestMode }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const projChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
    return () => {
      if (msgChannelRef.current) {
        supabase.removeChannel(msgChannelRef.current);
      }
      if (projChannelRef.current) {
        supabase.removeChannel(projChannelRef.current);
      }
    };
  }, [isGuestMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadProjects = async () => {
    if (isGuestMode) { setLoading(false); setProjects([]); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 1차: join 포함 시도
      let { data, error } = await supabase
        .from('startup_projects')
        .select('*, pm:project_managers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // join 실패 시 → join 없이 재시도
      if (error) {
        console.warn('PM join failed, retrying without join:', error.message);
        const fallback = await supabase
          .from('startup_projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        // 각 프로젝트에 PM 활동(PM 메시지 또는 PM 배정 시스템 메시지) 여부 조회
        const projectIds = data.map((d: any) => d.id);
        let pmActivityIds = new Set<string>();
        if (projectIds.length > 0) {
          const { data: pmMsgs } = await supabase
            .from('project_messages')
            .select('project_id, sender_type, message')
            .in('project_id', projectIds)
            .in('sender_type', ['PM', 'SYSTEM']);
          if (pmMsgs) {
            for (const msg of pmMsgs) {
              if (msg.sender_type === 'PM' ||
                  (msg.sender_type === 'SYSTEM' && msg.message?.includes('매니저가 배정'))) {
                pmActivityIds.add(msg.project_id);
              }
            }
          }
        }

        // PM join 실패 시 pm_id로 별도 조회
        const projects = await Promise.all(data.map(async (d: any) => {
          let pm = d.pm ? (Array.isArray(d.pm) ? d.pm[0] : d.pm) : null;
          if (d.pm_id && !pm) {
            try {
              const { data: pmData } = await supabase
                .from('project_managers')
                .select('*')
                .eq('id', d.pm_id)
                .single();
              if (pmData) pm = pmData;
            } catch {}
          }
          return { ...d, pm, has_pm_activity: pmActivityIds.has(d.id) };
        }));
        setProjects(projects);
      } else if (error) {
        console.error('프로젝트 조회 실패:', error.message);
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
    setLoading(false);
  };

  const reloadSelectedProject = async (projectId: string) => {
    try {
      let { data, error } = await supabase
        .from('startup_projects')
        .select('*, pm:project_managers(*)')
        .eq('id', projectId)
        .single();

      if (error) {
        const fallback = await supabase
          .from('startup_projects')
          .select('*')
          .eq('id', projectId)
          .single();
        data = fallback.data;
      }

      if (data) {
        let pm = data.pm ? (Array.isArray(data.pm) ? data.pm[0] : data.pm) : null;
        // PM join이 실패했지만 pm_id가 있으면 별도 조회
        if (data.pm_id && !pm) {
          try {
            const { data: pmData } = await supabase
              .from('project_managers')
              .select('*')
              .eq('id', data.pm_id)
              .single();
            if (pmData) pm = pmData;
          } catch {}
        }
        const updated = { ...data, pm };
        setSelectedProject(updated);
        // Also update in projects list
        setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
      }
    } catch (e) {
      console.error('Failed to reload project:', e);
    }
  };

  const subscribeToProjectUpdates = (projectId: string) => {
    if (projChannelRef.current) {
      supabase.removeChannel(projChannelRef.current);
    }
    const channel = supabase
      .channel(`consult-proj-${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'startup_projects',
        filter: `id=eq.${projectId}`
      }, () => {
        reloadSelectedProject(projectId);
      })
      .subscribe();
    projChannelRef.current = channel;
  };

  const openProject = (project: ProjectItem) => {
    setSelectedProject(project); // Show immediately with list data
    reloadSelectedProject(project.id); // Then fetch fresh data from DB
    loadMessages(project.id);
    subscribeToMessages(project.id);
    subscribeToProjectUpdates(project.id);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setMessages([]);
    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    if (msgChannelRef.current) {
      supabase.removeChannel(msgChannelRef.current);
      msgChannelRef.current = null;
    }
    if (projChannelRef.current) {
      supabase.removeChannel(projChannelRef.current);
      projChannelRef.current = null;
    }
    // Refresh projects list to reflect any changes that happened while chatting
    loadProjects();
  };

  const loadMessages = async (projectId: string) => {
    const { data } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    if (data) setMessages(data);
  };

  const subscribeToMessages = (projectId: string) => {
    if (msgChannelRef.current) {
      supabase.removeChannel(msgChannelRef.current);
    }
    const channel = supabase
      .channel(`consult-msgs-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id);
          return exists ? prev : [...prev, newMsg];
        });
        // Backup: when PM or SYSTEM message arrives, reload project data
        // in case the project subscription missed the status change
        if (newMsg.sender_type === 'PM' || newMsg.sender_type === 'SYSTEM') {
          reloadSelectedProject(projectId);
        }
      })
      .subscribe();
    msgChannelRef.current = channel;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!selectedProject?.id) return;

    setSending(true);
    try {
      let attachments: { url: string; type: string; name: string }[] | undefined;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${selectedProject.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, selectedImage);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('chat-images').getPublicUrl(fileName);
          attachments = [{ url: urlData.publicUrl, type: selectedImage.type, name: selectedImage.name }];
        }
      }

      const { data, error } = await supabase.from('project_messages').insert({
        project_id: selectedProject.id,
        sender_type: 'USER',
        message: newMessage.trim() || '📷 이미지',
        attachments: attachments || null
      }).select().single();

      if (!error && data) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === data.id);
          return exists ? prev : [...prev, data];
        });
      }
    } catch (err) {
      console.error('메시지 전송 실패:', err);
    }

    setNewMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setSending(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('5MB 이하 이미지만 가능합니다'); return; }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getBusinessLabel = (cat: string) => BUSINESS_LABELS[cat]?.label || cat;
  const getBusinessEmoji = (cat: string) => BUSINESS_LABELS[cat]?.emoji || '📦';

  // === 채팅 화면 (프로젝트 선택 시) ===
  if (selectedProject) {
    // PM이 실제로 채팅에 참여했는지 확인 (PM 메시지 또는 PM 배정 시스템 알림)
    const hasPmInChat = messages.some(m =>
      m.sender_type === 'PM' ||
      (m.sender_type === 'SYSTEM' && m.message.includes('매니저가 배정'))
    );
    // status가 PENDING_PM이고, PM이 채팅에 참여하지 않았으면 대기 상태
    const isPending = selectedProject.status === 'PENDING_PM' && !hasPmInChat;

    // 배지: PM이 채팅에 있으면 PM_ASSIGNED로 표시, 아니면 DB status 그대로
    const badgeStatus = (selectedProject.status === 'PENDING_PM' && hasPmInChat)
      ? 'PM_ASSIGNED'
      : selectedProject.status;
    const s = STATUS_MAP[badgeStatus] || { label: badgeStatus, color: 'gray' as const };

    // PM 이름: pm 데이터 없으면 시스템 메시지에서 추출 시도
    let pmName = selectedProject.pm?.name || '';
    if (!pmName && hasPmInChat) {
      const assignMsg = messages.find(m =>
        m.sender_type === 'SYSTEM' && m.message.includes('매니저가 배정')
      );
      if (assignMsg) {
        const match = assignMsg.message.match(/담당 매니저:\s*(.+?)(?:님|$)/m);
        if (match) pmName = match[1].trim();
      }
      if (!pmName) pmName = '담당 매니저';
    }

    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button onClick={closeProject} className="flex items-center gap-1 text-gray-600">
              <ChevronLeft size={24} />
              <span className="font-medium text-sm">목록</span>
            </button>
            {selectedProject.pm?.phone && (
              <a href={`tel:${selectedProject.pm.phone}`} className="p-2 text-gray-500 hover:text-brand-600">
                <Phone size={20} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(selectedProject.pm || pmName) ? (
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
                {(selectedProject.pm?.name || pmName)?.[0] || 'PM'}
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Clock size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate">
                  {pmName || 'PM 배정 대기'}
                </span>
                <Badge color={s.color}>{s.label}</Badge>
              </div>
              <p className="text-xs text-gray-400 truncate">
                {getBusinessLabel(selectedProject.business_category)} · {selectedProject.location_dong} · {selectedProject.store_size}평
              </p>
            </div>
          </div>
        </div>

        {/* PM 대기 상태 안내 */}
        {isPending && (
          <div className="bg-brand-50 px-4 py-3 text-center border-b border-brand-100">
            <p className="text-sm text-brand-700 font-medium">PM 배정을 기다리고 있습니다</p>
            <p className="text-xs text-brand-500 mt-0.5">배정되면 알림으로 안내해드립니다</p>
          </div>
        )}

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 && !isPending && (
            <div className="text-center py-10 text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">아직 메시지가 없습니다</p>
              <p className="text-xs mt-1">담당 매니저에게 먼저 인사해보세요</p>
            </div>
          )}
          {messages.map((msg) => {
            if (msg.sender_type === 'SYSTEM') {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="max-w-[85%]">
                    {msg.message.includes('\n') ? (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {(() => {
                          const parts = msg.message.split('\n\n');
                          const title = parts[0];
                          const body = parts.slice(1).join('\n\n').trim();
                          return (
                            <>
                              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                                <p className="text-sm font-bold text-gray-700 text-center">{title}</p>
                              </div>
                              {body && (
                                <div className="px-4 py-3">
                                  <p className="whitespace-pre-wrap text-[13px] text-gray-600 leading-relaxed">{body}</p>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">{msg.message}</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                    <p className="text-[10px] text-gray-300 mt-1 text-center">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            }
            const isUser = msg.sender_type === 'USER';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
                  {!isUser && (
                    <p className="text-[10px] text-gray-400 mb-1 ml-1">
                      {pmName || 'PM'}
                    </p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}>
                    {msg.message}
                  </div>
                  {msg.attachments?.map((att, i) => (
                    att.type?.startsWith('image') && (
                      <img key={i} src={att.url} alt="" className="mt-1 rounded-xl max-w-full max-h-48 object-cover" />
                    )
                  ))}
                  <p className={`text-[10px] mt-1 ${isUser ? 'text-right' : 'text-left'} text-gray-300`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="relative inline-block">
              <img src={imagePreview} alt="" className="h-16 rounded-lg" />
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        {!isPending && (
          <div className="p-3 bg-white border-t border-gray-200 shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-400 hover:text-brand-600 shrink-0"
              >
                <ImagePlus size={22} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="메시지를 입력하세요"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={sending || (!newMessage.trim() && !selectedImage)}
                className="p-2.5 text-brand-600 hover:text-brand-700 disabled:text-gray-300 shrink-0"
              >
                {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === 프로젝트 목록 ===
  const activeProjects = projects.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">내 상담</h1>

        <div className="flex gap-4">
          <div className="flex-1 bg-brand-50 rounded-xl p-4 border border-brand-100">
            <div className="text-2xl font-black text-brand-600 mb-1">{projects.length}</div>
            <div className="text-xs text-brand-800 font-bold">전체 프로젝트</div>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-black text-slate-900 mb-1">{activeProjects.length}</div>
            <div className="text-xs text-gray-500">진행중</div>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-black text-slate-900 mb-1">{completedProjects.length}</div>
            <div className="text-xs text-gray-500">완료</div>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className="p-4 space-y-4">
        <h2 className="font-bold text-slate-900 text-lg">프로젝트 목록</h2>

        {isGuestMode ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-2 font-medium">로그인이 필요합니다</p>
            <p className="text-xs text-gray-400 mb-6">로그인하면 프로젝트 목록과 채팅을 이용할 수 있어요</p>
            {onLoginRequired && (
              <button
                onClick={onLoginRequired}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all"
              >
                로그인하기
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 mb-2">진행 중인 프로젝트가 없습니다</p>
            <p className="text-xs text-gray-300">홈에서 창업 비용 확인 후 PM 배정을 받으세요</p>
          </div>
        ) : (
          projects.map(project => {
            // PM이 배정되었으면 배지를 PM_ASSIGNED로 표시
            const hasPm = !!(project.pm || project.pm_id || project.has_pm_activity);
            const listBadgeStatus = (project.status === 'PENDING_PM' && hasPm)
              ? 'PM_ASSIGNED'
              : project.status;
            const s = STATUS_MAP[listBadgeStatus] || { label: listBadgeStatus, color: 'gray' as const };
            const biz = BUSINESS_LABELS[project.business_category];
            return (
              <div
                key={project.id}
                onClick={() => openProject(project)}
                className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-brand-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge color={s.color}>{s.label}</Badge>
                  <span className="text-xs text-gray-400">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{getBusinessEmoji(project.business_category)}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {getBusinessLabel(project.business_category)} {project.store_size}평
                    </h3>
                    <p className="text-sm text-gray-500">
                      강남구 {project.location_dong}
                    </p>
                  </div>
                </div>

                {project.estimated_total > 0 && (
                  <div className="text-sm text-gray-500 mb-3">
                    예상 비용 <span className="font-bold text-brand-600">{formatPrice(project.estimated_total)}원</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {project.pm ? (
                      <>
                        <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-[10px]">
                          {project.pm.name?.[0]}
                        </div>
                        <span className="text-xs text-gray-500">{project.pm.name} 매니저</span>
                      </>
                    ) : (project.pm_id || project.has_pm_activity) ? (
                      <span className="text-xs text-gray-500">담당 매니저 배정됨</span>
                    ) : (
                      <span className="text-xs text-gray-400">PM 배정 대기</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-600">
                    <MessageSquare size={14} />
                    채팅하기
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
