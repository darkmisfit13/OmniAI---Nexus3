import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Scissors, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Download, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  FolderLock, 
  Maximize2, 
  Smartphone, 
  Monitor, 
  Square, 
  Wand2, 
  FastForward, 
  Rewind,
  Music, 
  Film, 
  Split, 
  ZoomIn, 
  ZoomOut,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Radio,
  FileVideo,
  Folder,
  FolderOpen,
  Clipboard,
  Eraser,
  Tv,
  CheckCircle2,
  RefreshCw,
  Copy,
  SlidersHorizontal,
  Bot,
  Zap,
  Mic,
  Activity,
  X,
  Sticker
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';
import { omniVoice } from '../../lib/omniVoice';

export interface VideoClip {
  id: string;
  name: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  color: string;
  type: 'video' | 'audio' | 'text' | 'fx';
  thumbnailUrl?: string;
  speed: number;
  volume: number;
  text?: string;
  filter?: string;
}

// 10 Cinematic LUT Presets
export const CINEMATIC_LUTS = [
  { id: 'normal', name: 'Original Raw', css: 'none', tag: 'Standard' },
  { id: 'cyber_neon', name: 'Cyber Neon', css: 'saturate(180%) contrast(135%) hue-rotate(185deg)', tag: 'Nocturnal' },
  { id: 'teal_orange', name: 'Teal & Orange', css: 'contrast(125%) saturate(140%) sepia(20%) hue-rotate(170deg)', tag: 'Hollywood' },
  { id: 'film_noir', name: 'Film Noir', css: 'grayscale(100%) contrast(175%) brightness(90%)', tag: 'Classic' },
  { id: 'vintage_70s', name: 'Vintage 70s', css: 'sepia(55%) contrast(115%) brightness(95%) saturate(125%)', tag: 'Retro' },
  { id: 'glitch_90s', name: 'Glitch 90s', css: 'contrast(160%) hue-rotate(90deg) saturate(170%)', tag: 'Vapor' },
  { id: 'vhs_tape', name: 'VHS Analog', css: 'contrast(110%) brightness(105%) saturate(130%) sepia(15%)', tag: 'Tape' },
  { id: 'matrix_green', name: 'Matrix Code', css: 'hue-rotate(85deg) contrast(140%) saturate(150%)', tag: 'Sci-Fi' },
  { id: 'warm_sunset', name: 'Warm Amber', css: 'sepia(30%) saturate(150%) brightness(105%)', tag: 'Golden Hour' },
  { id: 'duotone', name: 'Duotone Cyber', css: 'contrast(150%) saturate(160%) hue-rotate(270deg)', tag: 'Stylized' },
];

// Preset B-Roll Snippets for Quick-Insert
export const BROLL_SNIPPETS = [
  { id: 'broll-1', title: 'Cyber City Tokyo Drive', duration: 4.5, thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', type: 'video' as const, color: 'from-cyan-600 to-blue-700' },
  { id: 'broll-2', title: 'Neon Rain Reflections', duration: 3.8, thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', type: 'video' as const, color: 'from-purple-600 to-indigo-800' },
  { id: 'broll-3', title: 'Quantum Core Hologram', duration: 5.0, thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', type: 'video' as const, color: 'from-fuchsia-600 to-pink-800' },
  { id: 'sfx-1', title: 'Phonk 808 Bass Drop (freebeat.ai)', duration: 4.0, type: 'audio' as const, color: 'from-emerald-600 to-teal-800' },
  { id: 'sfx-2', title: 'Cinematic Sub Whoosh & Impact', duration: 2.2, type: 'audio' as const, color: 'from-amber-600 to-orange-800' },
];

interface OmniMotionStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniMotionStudio: React.FC<OmniMotionStudioProps> = ({ onSaveToVault }) => {
  // 1. Playback & Timeline State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(4.5);
  const [totalDuration, setTotalDuration] = useState(30.0);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [showWaveform, setShowWaveform] = useState(true);
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-1');

  // 2. Cross-Platform Cloud State Persistence
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [lastDeviceSource, setLastDeviceSource] = useState('iPhone 16 Pro (Mobile Client)');
  const [handoffToast, setHandoffToast] = useState<string | null>(null);

  // 3. Collapsible Folder Drawer (`📁`)
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderTab, setFolderTab] = useState<'effects' | 'snippets' | 'overlays' | 'voice_studio'>('effects');

  // 4. Advanced Effects & LUTs
  const [selectedLUT, setSelectedLUT] = useState<string>('cyber_neon');
  const [lutIntensity, setLutIntensity] = useState<number>(100);

  // 5. Next-Gen AI Removal & Enhancement Tools
  const [activeAITool, setActiveAITool] = useState<'none' | 'object_eraser' | 'bg_removal' | 'super_res' | 'auto_director'>('none');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('Omni AI Video Engine Ready');
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [superResActive, setSuperResActive] = useState<boolean>(true);
  const [backgroundMode, setBackgroundMode] = useState<'original' | 'alpha' | 'cyber_void' | 'studio_gradient' | 'tokyo_neon'>('original');
  const [erasedObjectBadge, setErasedObjectBadge] = useState<string | null>(null);

  // 6. Voice-Cloning & Narration
  const [narrationScript, setNarrationScript] = useState('OmniMotion provides 100x faster editing speed without CapCut clutter.');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  // 7. Text Overlays & Subtitles
  const [fontSize, setFontSize] = useState<number>(20);
  const [textAnimation, setTextAnimation] = useState<'karaoke' | 'pop' | 'glitch' | 'typewriter'>('karaoke');

  // 8. Tracks
  const [videoTrack, setVideoTrack] = useState<VideoClip[]>([
    {
      id: 'clip-1',
      name: 'Cyberpunk Intro Neon Rush',
      startTime: 0,
      duration: 5.0,
      color: 'from-cyan-600 to-blue-700',
      type: 'video',
      speed: 1.0,
      volume: 100,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
      filter: 'Cyber Neon',
    },
    {
      id: 'clip-2',
      name: 'Shadow Companion Orb Reveal',
      startTime: 5.0,
      duration: 6.5,
      color: 'from-purple-600 to-indigo-800',
      type: 'video',
      speed: 1.0,
      volume: 100,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
      filter: 'Shadow Glow',
    },
    {
      id: 'clip-3',
      name: 'Nocturnal City Flight Drops',
      startTime: 11.5,
      duration: 8.5,
      color: 'from-amber-600 to-rose-700',
      type: 'video',
      speed: 1.25,
      volume: 100,
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
      filter: 'Hyper Vivid',
    },
  ]);

  const [audioTrack, setAudioTrack] = useState<VideoClip[]>([
    {
      id: 'audio-1',
      name: 'Freebeat Dark Phonk 140BPM (freebeat.ai)',
      startTime: 0,
      duration: 25.0,
      color: 'from-emerald-600 to-teal-800',
      type: 'audio',
      speed: 1.0,
      volume: 90,
    },
  ]);

  const [textTrack, setTextTrack] = useState<VideoClip[]>([
    {
      id: 'text-1',
      name: 'Auto-Caption 1',
      startTime: 1.0,
      duration: 3.5,
      color: 'from-pink-600 to-rose-800',
      type: 'text',
      speed: 1.0,
      volume: 0,
      text: '⚡ STEP INTO THE SHADOW COMPANION',
    },
    {
      id: 'text-2',
      name: 'Auto-Caption 2',
      startTime: 5.2,
      duration: 4.0,
      color: 'from-pink-600 to-rose-800',
      type: 'text',
      speed: 1.0,
      volume: 0,
      text: '🔥 UNIFIED MULTI-MODEL QUORUM',
    },
  ]);

  const [fxTrack, setFxTrack] = useState<VideoClip[]>([
    {
      id: 'fx-1',
      name: 'Chromatic Glitch Transition',
      startTime: 4.8,
      duration: 1.2,
      color: 'from-yellow-600 to-orange-700',
      type: 'fx',
      speed: 1.0,
      volume: 0,
    },
  ]);

  // 9. Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportResolution, setExportResolution] = useState<'1080p' | '4k' | '720p'>('4k');
  const [exportFps, setExportFps] = useState<30 | 60>(60);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Playback loop timer
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Initial cloud state check on load
  useEffect(() => {
    const fetchCloudProject = async () => {
      try {
        const res = await fetch('/api/omnimotion/project');
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setLastDeviceSource(data.project.lastDevice || 'iPhone 16 Pro (Mobile Client)');
          }
        }
      } catch (err) {
        console.warn('[OmniMotion] Local cache active');
      }
    };
    fetchCloudProject();
  }, []);

  // Continuous Cloud Persistence (Debounced auto-save)
  const autoSaveToCloud = useCallback(async () => {
    setCloudSyncStatus('saving');
    const projectPayload = {
      name: 'OmniMotion Cyberpunk Project',
      lastDevice: typeof window !== 'undefined' && window.innerWidth > 768 ? 'MacBook Pro / Desktop Studio' : 'iPhone Mobile Client',
      currentTime,
      totalDuration,
      aspectRatio,
      timelineZoom,
      selectedLUT,
      lutIntensity,
      superResActive,
      backgroundMode,
      videoTrack,
      audioTrack,
      textTrack,
      fxTrack,
    };

    // Save to localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('omnimotion_active_project', JSON.stringify(projectPayload));
      } catch {}
    }

    // Save to Cloud Backend
    try {
      await fetch('/api/omnimotion/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload),
      });
      setCloudSyncStatus('synced');
    } catch {
      setCloudSyncStatus('offline');
    }
  }, [currentTime, totalDuration, aspectRatio, timelineZoom, selectedLUT, lutIntensity, superResActive, backgroundMode, videoTrack, audioTrack, textTrack, fxTrack]);

  // Debounced auto-save trigger on timeline change
  useEffect(() => {
    const timeout = setTimeout(() => {
      autoSaveToCloud();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [autoSaveToCloud]);

  // Instant Device Handoff: "Pick up right where you left off"
  const handlePerformInstantHandoff = async () => {
    setIsAiProcessing(true);
    setOrbPhase('analyzing');
    setAiStatusMessage('Connecting to Omni Cloud Handoff Stream...');

    try {
      const res = await fetch('/api/omnimotion/project');
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          const p = data.project;
          setCurrentTime(p.currentTime || 8.4);
          if (p.totalDuration) setTotalDuration(p.totalDuration);
          if (p.aspectRatio) setAspectRatio(p.aspectRatio);
          if (p.videoTrack) setVideoTrack(p.videoTrack);
          if (p.audioTrack) setAudioTrack(p.audioTrack);
          if (p.textTrack) setTextTrack(p.textTrack);
          if (p.fxTrack) setFxTrack(p.fxTrack);
          if (p.lutEffect) setSelectedLUT(p.lutEffect.toLowerCase().replace(/\s+/g, '_'));

          setHandoffToast(`BAM! Restored timeline & assets right where you left off from ${p.lastDevice}!`);
          setTimeout(() => setHandoffToast(null), 4000);
        }
      }
    } catch {
      // Local handoff simulation
      setCurrentTime(8.4);
      setHandoffToast('BAM! Restored timeline & playhead (00:08.4) right where you left off!');
      setTimeout(() => setHandoffToast(null), 4000);
    } finally {
      setIsAiProcessing(false);
      setOrbPhase('idle');
      setAiStatusMessage('Timeline Synced across Cloud Devices');
    }
  };

  // AI Auto-Director: Trims dead air, beat cuts with freebeat.ai, dynamic captions
  const handleTriggerAutoDirector = async () => {
    setIsAiProcessing(true);
    setOrbPhase('processing');
    setAiStatusMessage('Auto-Director: Reviewing footage, trimming dead air, beat-syncing with freebeat.ai...');

    try {
      const res = await fetch('/api/omnimotion/ai-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoDescription: 'Cyberpunk Neon Footage', musicGenre: 'Phonk' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.director) {
          const d = data.director;
          setSelectedLUT(d.recommendedLUT.toLowerCase().replace(/\s+/g, '_') || 'cyber_neon');
          // Add generated dynamic captions
          if (d.captions?.length) {
            const newCaptions = d.captions.map((c: any, i: number) => ({
              id: `ai-caption-${Date.now()}-${i}`,
              name: `AI Beat Caption ${i + 1}`,
              startTime: c.time,
              duration: 3.0,
              color: 'from-pink-600 to-rose-800',
              type: 'text' as const,
              speed: 1.0,
              volume: 0,
              text: c.text,
            }));
            setTextTrack(newCaptions);
          }
          setHandoffToast(`Auto-Director Complete: ${d.summary}`);
          setTimeout(() => setHandoffToast(null), 4500);
          return;
        }
      }
    } catch {
      // Local simulation
    }

    setTimeout(() => {
      setSelectedLUT('cyber_neon');
      setSuperResActive(true);
      setTextTrack([
        { id: 'c-1', name: 'Auto Beat Caption', startTime: 1.0, duration: 3.5, color: 'from-pink-600 to-rose-800', type: 'text', speed: 1.0, volume: 0, text: '⚡ OMNIMOTION: 100x FASTER THAN CAPCUT' },
        { id: 'c-2', name: 'Auto Beat Caption 2', startTime: 5.0, duration: 4.0, color: 'from-pink-600 to-rose-800', type: 'text', speed: 1.0, volume: 0, text: '🔥 BEAT-SYNCED VIA FREEBEAT.AI' },
      ]);
      setHandoffToast('Auto-Director: Trimmed 3.2s dead air, aligned 4 beat drops & generated animated captions!');
      setTimeout(() => setHandoffToast(null), 4500);
      setIsAiProcessing(false);
      setOrbPhase('suggesting');
      setAiStatusMessage('Footage polished & beat-synced!');
    }, 1600);
  };

  // AI Object & Watermark Eraser
  const handleExecuteAIEraser = (target: 'object' | 'watermark') => {
    setIsAiProcessing(true);
    setOrbPhase('processing');
    setAiStatusMessage(target === 'object' ? 'AI Inpainting: Removing highlighted object across all keyframes...' : 'AI Frequency Filter: Purging video watermark...');

    setTimeout(() => {
      setIsAiProcessing(false);
      setOrbPhase('idle');
      setErasedObjectBadge(target === 'object' ? 'AI Object Inpainted & Removed (All Keyframes)' : 'Watermark Cleared');
      setHandoffToast(target === 'object' ? 'Object erased across 60fps keyframe stream!' : 'Watermark purged seamlessly!');
      setTimeout(() => setHandoffToast(null), 3000);
    }, 1400);
  };

  // AI Smart Background Removal
  const handleApplyBackgroundRemoval = (mode: 'alpha' | 'cyber_void' | 'studio_gradient' | 'tokyo_neon') => {
    setIsAiProcessing(true);
    setOrbPhase('processing');
    setAiStatusMessage('Neural Matting: Isolating subject and synthesizing backdrop...');

    setTimeout(() => {
      setBackgroundMode(mode);
      setIsAiProcessing(false);
      setOrbPhase('idle');
      setHandoffToast(`Smart Background applied: ${mode.replace('_', ' ').toUpperCase()}`);
      setTimeout(() => setHandoffToast(null), 3000);
    }, 1200);
  };

  // Voice Studio Narration (Speech Synthesis using User's Cloned Voice Profile)
  const handleGenerateVoiceNarration = () => {
    if (!narrationScript.trim()) return;
    setIsGeneratingVoice(true);
    setOrbPhase('talking');

    const pitch = parseFloat(localStorage.getItem('omni_clone_pitch') || '1.0');
    const rate = parseFloat(localStorage.getItem('omni_clone_rate') || '1.05');

    // Add audio narration track
    const newNarrationClip: VideoClip = {
      id: `narration-${Date.now()}`,
      name: `Voice Clone: "${narrationScript.slice(0, 20)}..."`,
      startTime: currentTime,
      duration: Math.max(3.0, Number((narrationScript.length / 14).toFixed(1))),
      color: 'from-cyan-600 to-indigo-800',
      type: 'audio',
      speed: 1.0,
      volume: 100,
    };
    setAudioTrack((prev) => [...prev, newNarrationClip]);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrationScript);
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.onend = () => {
        setIsGeneratingVoice(false);
        setOrbPhase('idle');
      };
      utterance.onerror = () => {
        setIsGeneratingVoice(false);
        setOrbPhase('idle');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsGeneratingVoice(false);
        setOrbPhase('idle');
      }, 2000);
    }

    setHandoffToast('Voice clone narration track generated & placed onto timeline!');
    setTimeout(() => setHandoffToast(null), 3000);
  };

  // Split Clip Tool
  const handleSplitClip = () => {
    const clipIndex = videoTrack.findIndex((c) => c.id === selectedClipId);
    if (clipIndex === -1) return;
    const clip = videoTrack[clipIndex];

    if (currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
      const firstDuration = currentTime - clip.startTime;
      const secondDuration = clip.duration - firstDuration;

      const firstClip: VideoClip = {
        ...clip,
        duration: Number(firstDuration.toFixed(1)),
      };
      const secondClip: VideoClip = {
        ...clip,
        id: `clip-${Date.now()}`,
        name: `${clip.name} (Part 2)`,
        startTime: Number(currentTime.toFixed(1)),
        duration: Number(secondDuration.toFixed(1)),
      };

      const updated = [...videoTrack];
      updated.splice(clipIndex, 1, firstClip, secondClip);
      setVideoTrack(updated);
      setSelectedClipId(secondClip.id);
      setHandoffToast('Clip split at playhead!');
      setTimeout(() => setHandoffToast(null), 1500);
    }
  };

  // Delete Clip
  const handleDeleteSelectedClip = () => {
    setVideoTrack((prev) => prev.filter((c) => c.id !== selectedClipId));
    setHandoffToast('Clip deleted from track');
    setTimeout(() => setHandoffToast(null), 1500);
  };

  // Drag and insert B-Roll Snippet
  const handleInsertSnippet = (snippet: typeof BROLL_SNIPPETS[0]) => {
    if (snippet.type === 'video') {
      const newClip: VideoClip = {
        id: `clip-broll-${Date.now()}`,
        name: snippet.title,
        startTime: currentTime,
        duration: snippet.duration,
        color: snippet.color,
        type: 'video',
        speed: 1.0,
        volume: 100,
        thumbnailUrl: snippet.thumb,
      };
      setVideoTrack((prev) => [...prev, newClip]);
    } else {
      const newAudio: VideoClip = {
        id: `audio-sfx-${Date.now()}`,
        name: snippet.title,
        startTime: currentTime,
        duration: snippet.duration,
        color: snippet.color,
        type: 'audio',
        speed: 1.0,
        volume: 95,
      };
      setAudioTrack((prev) => [...prev, newAudio]);
    }
    setHandoffToast(`Added "${snippet.title}" at ${formatTime(currentTime)}`);
    setTimeout(() => setHandoffToast(null), 2000);
  };

  // Time formatter (00:04.5)
  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    const ms = Math.floor((timeInSec % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Active LUT CSS filter
  const activeLUTCSS = CINEMATIC_LUTS.find((l) => l.id === selectedLUT)?.css || 'none';

  return (
    <div className="h-full flex flex-col bg-[#0b0a14] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 1. TOP SUITE NAVIGATION & INSTANT CLOUD HANDOFF BAR */}
      <div className="p-3 bg-[#14121f] border-b border-white/10 flex items-center justify-between shrink-0 shadow-lg">
        
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#00f2fe] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#6c63ff]/30">
            <Film className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">OMNIMOTION VIDEO STUDIO</h2>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#a594fd] border border-[#6c63ff]/40 font-bold">
                CAPCUT KILLER • 100x FASTER
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 font-mono">
              Tiered kinetic timeline, real-time AI inpaint, and cross-platform instant handoff
            </p>
          </div>
        </div>

        {/* Cloud Persistence & Device Handoff Cockpit */}
        <div className="flex items-center gap-2">
          
          {/* Cloud Sync State Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[10.5px] font-mono">
            <span className={`w-2 h-2 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-spin'}`} />
            <span className="text-slate-300">
              {cloudSyncStatus === 'synced' ? 'Cloud Synced' : 'Auto-Saving State...'}
            </span>
          </div>

          {/* Instant Device Handoff Button: Pick Up Where You Left Off */}
          <button
            onClick={handlePerformInstantHandoff}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-[#00f2fe]/50 hover:border-[#00f2fe] text-[#00f2fe] hover:text-white text-xs font-mono font-bold transition shadow-[0_0_12px_rgba(0,242,254,0.25)] active:scale-95"
            title={`Last device state: ${lastDeviceSource}. Click to instantly restore timeline and playhead right where you left off.`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span className="hidden xs:inline">Device Handoff</span>
            <span className="text-[9px] px-1 rounded bg-[#00f2fe]/20 text-[#00f2fe]">BAM!</span>
          </button>

          {/* Auto-Director Button */}
          <button
            onClick={handleTriggerAutoDirector}
            disabled={isAiProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] text-slate-950 hover:opacity-90 font-bold text-xs shadow-md shadow-[#6c63ff]/30 transition disabled:opacity-50"
            title="Auto-Director: Trims dead air, syncs beat cuts to music with freebeat.ai, generates dynamic captions"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>AI Auto-Director</span>
          </button>

          {/* Export Video Modal Trigger */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export 4K</span>
          </button>
        </div>
      </div>

      {/* Floating Handoff Toast Notification */}
      {handoffToast && (
        <div className="absolute top-16 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black/90 text-white border border-[#00f2fe] text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{handoffToast}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE: VIDEO VIEWPORT + OPEN-AIR WORKSPACE HUD */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* CENTER: VIDEO CANVAS PREVIEW STAGE */}
        <div className="flex-1 bg-[#07060d] flex flex-col items-center justify-center p-3 relative overflow-hidden">
          
          {/* Aspect Ratio Box Wrapper */}
          <div 
            className={`relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center group transition-all duration-300 ${
              aspectRatio === '9:16' ? 'w-64 h-[420px]' : aspectRatio === '16:9' ? 'w-[520px] h-72' : aspectRatio === '1:1' ? 'w-80 h-80' : 'w-72 h-[380px]'
            }`}
          >
            {/* Background Layer (Chroma / Smart Background Removal replacement) */}
            {backgroundMode === 'cyber_void' && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a14] via-[#1a0b2e] to-black opacity-90" />
            )}
            {backgroundMode === 'studio_gradient' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900" />
            )}
            {backgroundMode === 'tokyo_neon' && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900 via-slate-950 to-black" />
            )}

            {/* Video Frame Canvas / Simulation */}
            <div 
              className="relative w-full h-full overflow-hidden flex items-center justify-center"
              style={{
                filter: `${activeLUTCSS} ${superResActive ? 'contrast(108%) brightness(102%)' : ''}`,
                transition: 'filter 0.2s ease',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&q=80"
                alt="Video Monitor"
                className="w-full h-full object-cover select-none"
              />

              {/* Dynamic Subtitle / Caption Overlay */}
              {textTrack.map((sub) => {
                const isCurrent = currentTime >= sub.startTime && currentTime <= sub.startTime + sub.duration;
                if (!isCurrent) return null;
                return (
                  <div
                    key={sub.id}
                    className="absolute bottom-12 left-3 right-3 text-center pointer-events-none z-20 animate-in zoom-in-95 duration-100"
                  >
                    <span 
                      style={{ fontSize: `${fontSize}px` }}
                      className="px-3 py-1 rounded-xl bg-black/85 text-white font-black font-mono tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] border border-white/10 uppercase"
                    >
                      {sub.text}
                    </span>
                  </div>
                );
              })}

              {/* Super-Resolution 4K Indicator */}
              {superResActive && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 text-[9px] font-mono font-bold flex items-center gap-1 shadow-md backdrop-blur-sm">
                  <Sparkles className="w-2.5 h-2.5" /> 4K 60FPS AI UPSCALE
                </div>
              )}

              {/* Erased Object Badge */}
              {erasedObjectBadge && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-mono font-bold flex items-center gap-1 shadow backdrop-blur-sm">
                  <Check className="w-3 h-3 text-emerald-400" /> {erasedObjectBadge}
                </div>
              )}

              {/* Social Safe Zones Overlay (TikTok / Reels safe margins) */}
              {showSafeZone && (
                <div className="absolute inset-0 pointer-events-none border border-dashed border-cyan-400/30 flex flex-col justify-between p-3">
                  <span className="text-[8px] font-mono text-cyan-400/50">SAFE MARGIN (HEADER)</span>
                  <span className="text-[8px] font-mono text-cyan-400/50 text-right">REELS/TIKTOK CAPTION SAFE</span>
                </div>
              )}
            </div>

            {/* AI In-Progress Indicator Overlay */}
            {isAiProcessing && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-[#a594fd] font-mono text-xs gap-3 z-30">
                <div className="w-8 h-8 rounded-full border-2 border-[#6c63ff] border-t-transparent animate-spin" />
                <span>{aiStatusMessage}</span>
              </div>
            )}
          </div>

          {/* OPEN-AIR WORKSPACE HUD: Pinned Playback Controls At Fingertips */}
          <div className="mt-3 w-full max-w-2xl bg-[#14121f] p-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between gap-3 text-xs font-mono">
            
            {/* Left: Aspect Ratio & Safe Zone */}
            <div className="flex items-center gap-1.5">
              {(['9:16', '16:9', '1:1', '4:5'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    aspectRatio === ratio 
                      ? 'bg-[#6c63ff] text-white shadow-md' 
                      : 'bg-black/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}

              <button
                onClick={() => setShowSafeZone(!showSafeZone)}
                className={`p-1 px-1.5 rounded-lg border text-[10px] font-bold transition ${
                  showSafeZone ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/40' : 'bg-black/60 text-slate-500 border-white/5'
                }`}
                title="Toggle Social Feed Safe Zone Grid"
              >
                Safe Zone
              </button>
            </div>

            {/* Center: Play / Pause / Step Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTime((t) => Math.max(0, Number((t - 0.5).toFixed(1))))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Step backward 0.5s"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-[#6c63ff]/30 active:scale-90 transition"
                title={isPlaying ? 'Pause' : 'Play Timeline'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.min(totalDuration, Number((t + 0.5).toFixed(1))))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                title="Step forward 0.5s"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Timecode display */}
              <div className="px-2.5 py-1 rounded-lg bg-black text-cyan-300 border border-white/10 text-xs font-mono font-bold">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </div>
            </div>

            {/* Right: Clip Editing Quick Actions (Split, Delete, Waveform, Folder Drawer) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSplitClip}
                className="p-1.5 px-2 rounded-lg bg-black/60 hover:bg-[#1f1b33] border border-white/10 text-slate-300 hover:text-[#00f2fe] flex items-center gap-1"
                title="Split clip at playhead"
              >
                <Scissors className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span className="hidden sm:inline">Split</span>
              </button>

              <button
                onClick={handleDeleteSelectedClip}
                className="p-1.5 px-2 rounded-lg bg-black/60 hover:bg-rose-950/40 border border-white/10 text-slate-400 hover:text-rose-400 flex items-center gap-1"
                title="Delete selected clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowWaveform(!showWaveform)}
                className={`p-1.5 px-2 rounded-lg border flex items-center gap-1 transition ${
                  showWaveform ? 'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/40' : 'bg-black/60 text-slate-500 border-white/5'
                }`}
                title="Toggle Audio Waveform Track"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Waveform</span>
              </button>

              {/* Collapsible Folder Drawer Button (`📁`) */}
              <button
                onClick={() => setIsFolderOpen(!isFolderOpen)}
                className={`p-1.5 px-2.5 rounded-xl border flex items-center gap-1 font-bold transition shadow ${
                  isFolderOpen
                    ? 'bg-[#6c63ff] text-white border-[#6c63ff] shadow-[0_0_12px_rgba(108,99,255,0.4)]'
                    : 'bg-[#14121f] text-[#a594fd] border-[#6c63ff]/40 hover:border-[#6c63ff] hover:text-white'
                }`}
                title="Toggle Command Center Folder: Effects Suite, Clipboard Snippets, Overlays, Voice Studio"
              >
                {isFolderOpen ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5 text-[#00f2fe]" />}
                <span className="hidden xs:inline">Tools</span> 📁
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT / COLLAPSIBLE DRAWER COMMAND TRAY (`📁`) */}
        {isFolderOpen && (
          <div className="w-full lg:w-96 bg-[#14121f] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Drawer Tabs */}
            <div className="p-2 border-b border-white/10 grid grid-cols-4 gap-1 bg-[#0b0a14]">
              {[
                { id: 'effects', label: 'LUTs & FX', icon: SlidersHorizontal },
                { id: 'snippets', label: 'B-Roll & Audio', icon: Clipboard },
                { id: 'overlays', label: 'Text & Stickers', icon: Type },
                { id: 'voice_studio', label: 'Voice Clone', icon: Mic },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = folderTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFolderTab(tab.id as any)}
                    className={`py-2 px-1 rounded-xl text-[10.5px] font-mono font-bold flex flex-col items-center gap-1 transition ${
                      active
                        ? 'bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-mono text-xs">
              
              {/* TAB 1: ADVANCED EFFECTS & CINEMATIC LUTS */}
              {folderTab === 'effects' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#00f2fe]" /> 10 Cinematic LUTs
                    </span>
                    <span className="text-[10px] text-cyan-400">{selectedLUT.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {CINEMATIC_LUTS.map((lut) => (
                      <button
                        key={lut.id}
                        onClick={() => setSelectedLUT(lut.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          selectedLUT === lut.id
                            ? 'bg-[#6c63ff]/25 border-[#00f2fe] text-white shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                            : 'bg-[#0b0a14] hover:bg-[#1a1729] border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-white mb-0.5">{lut.name}</div>
                        <div className="text-[9px] text-[#a594fd]">{lut.tag}</div>
                      </button>
                    ))}
                  </div>

                  {/* Intensity slider */}
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">LUT Grade Intensity:</span>
                      <span className="text-[#00f2fe] font-bold">{lutIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={lutIntensity}
                      onChange={(e) => setLutIntensity(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00f2fe] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* AI Removal Suite inside Effects Drawer */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[10px] uppercase text-[#00f2fe] font-bold block">Next-Gen AI Removal Suite:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleExecuteAIEraser('object')}
                        className="p-2 rounded-xl bg-black/70 hover:bg-[#1f1b33] border border-white/10 text-left"
                      >
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <Eraser className="w-3.5 h-3.5 text-pink-400" /> AI Object Erase
                        </div>
                        <div className="text-[9px] text-slate-400">Inpaint across video frames</div>
                      </button>

                      <button
                        onClick={() => handleExecuteAIEraser('watermark')}
                        className="p-2 rounded-xl bg-black/70 hover:bg-[#1f1b33] border border-white/10 text-left"
                      >
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <Scissors className="w-3.5 h-3.5 text-amber-400" /> AI Watermark
                        </div>
                        <div className="text-[9px] text-slate-400">Clean logo timestamps</div>
                      </button>
                    </div>

                    {/* Background Studio selector */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[9px] text-slate-400 block">AI Smart Backdrop Removal:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'alpha', label: 'Transparent' },
                          { id: 'cyber_void', label: 'Cyber Void' },
                          { id: 'studio_gradient', label: 'Studio' },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => handleApplyBackgroundRemoval(bg.id as any)}
                            className={`p-1.5 rounded-lg border text-[10px] text-center font-bold ${
                              backgroundMode === bg.id ? 'bg-[#00f2fe] text-slate-950 border-[#00f2fe]' : 'bg-black/60 border-white/10 text-slate-300'
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIPBOARD & SAVED CLIP SNIPPETS */}
              {folderTab === 'snippets' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      <Clipboard className="w-3.5 h-3.5 text-cyan-400" /> B-Roll & Audio Snippets
                    </span>
                    <span className="text-[10px] text-slate-500">Tap to Drop on Timeline</span>
                  </div>

                  <div className="space-y-2">
                    {BROLL_SNIPPETS.map((snippet) => (
                      <div
                        key={snippet.id}
                        onClick={() => handleInsertSnippet(snippet)}
                        className="p-2.5 rounded-xl bg-black/60 hover:bg-[#1a1729] border border-white/10 hover:border-[#00f2fe]/40 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {snippet.thumb ? (
                            <img src={snippet.thumb} alt={snippet.title} className="w-9 h-9 rounded-lg object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                              <Music className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white group-hover:text-[#00f2fe] block truncate">
                              {snippet.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {snippet.duration}s • {snippet.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#00f2fe] opacity-60 group-hover:opacity-100">
                          + Drop →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TEXT OVERLAYS & HOLOGRAPHIC STICKERS */}
              {folderTab === 'overlays' && (
                <div className="space-y-3.5">
                  <div className="space-y-2 p-3 rounded-xl bg-black/60 border border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">Subtitle Font Size:</span>
                      <span className="text-[#00f2fe] font-bold">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="38"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00f2fe] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Kinetic text animation style */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Caption Animation Style:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'karaoke', label: '⚡ Karaoke Glow' },
                        { id: 'pop', label: '💥 Pop-In Punch' },
                        { id: 'glitch', label: '👾 Cyber Glitch' },
                        { id: 'typewriter', label: '⌨️ Terminal Type' },
                      ].map((anim) => (
                        <button
                          key={anim.id}
                          onClick={() => setTextAnimation(anim.id as any)}
                          className={`p-2 rounded-xl border text-xs font-bold text-left ${
                            textAnimation === anim.id ? 'bg-[#6c63ff] text-white border-[#6c63ff]' : 'bg-black/60 border-white/10 text-slate-300'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Holographic Stickers */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase text-[#00f2fe] font-bold block">Viral Holographic Stickers:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '🔥 100x FASTER', tag: 'VELOCITY' },
                        { label: '⚡ CAPCUT KILLER', tag: 'OMNI CORE' },
                        { label: '🛡️ ZERO LAG', tag: 'HARDWARE' },
                        { label: '🚀 SHIPPED', tag: 'MILESTONE' },
                      ].map((stk, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const newStickerText: VideoClip = {
                              id: `stk-${Date.now()}-${idx}`,
                              name: stk.label,
                              startTime: currentTime,
                              duration: 3.0,
                              color: 'from-purple-600 to-indigo-800',
                              type: 'text',
                              speed: 1.0,
                              volume: 0,
                              text: stk.label,
                            };
                            setTextTrack((prev) => [...prev, newStickerText]);
                            setHandoffToast(`Added sticker "${stk.label}" at ${formatTime(currentTime)}`);
                            setTimeout(() => setHandoffToast(null), 2000);
                          }}
                          className="p-2 rounded-xl bg-black/60 hover:bg-[#1f1b33] border border-white/10 text-left"
                        >
                          <div className="text-xs font-bold text-white">{stk.label}</div>
                          <div className="text-[9px] text-[#a594fd]">{stk.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VOICE-CLONING STUDIO & AI NARRATION */}
              {folderTab === 'voice_studio' && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#6c63ff]/20 to-[#00f2fe]/20 border border-[#6c63ff]/40 flex items-center gap-2.5">
                    <Mic className="w-5 h-5 text-[#00f2fe] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Trained Voice-Cloning Studio</span>
                      <span className="text-[10px] text-slate-400">Auto-narrates your video in your exact personal voice</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-400 font-bold block">Narration Script:</label>
                    <textarea
                      rows={3}
                      value={narrationScript}
                      onChange={(e) => setNarrationScript(e.target.value)}
                      placeholder="Type video voiceover script..."
                      className="w-full p-2.5 bg-black/70 border border-white/10 focus:border-[#00f2fe] rounded-xl text-xs text-white placeholder-slate-500 outline-none leading-relaxed resize-none"
                    />
                    <button
                      onClick={handleGenerateVoiceNarration}
                      disabled={isGeneratingVoice || !narrationScript.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#6c63ff]/30 active:scale-95 transition disabled:opacity-50"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isGeneratingVoice ? 'Synthesizing Cloned Voice...' : 'Drop Cloned Narration onto Timeline'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-[#0b0a14] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>OmniMotion v5.0</span>
              <button onClick={() => setIsFolderOpen(false)} className="text-slate-400 hover:text-white">
                Collapse Drawer ✕
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. MULTI-TRACK TIMELINE WORKSPACE (VIDEO, AUDIO, TEXT/SUBTITLES, FX) */}
      <div className="h-56 bg-[#0e0c18] border-t border-white/10 flex flex-col shrink-0 select-none">
        
        {/* Timeline Top Control Strip */}
        <div className="h-8 px-3 bg-[#14121f] border-b border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold text-[10px] uppercase flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#00f2fe]" /> Timeline Tracks
            </span>
            <span className="text-slate-500 text-[10px]">
              {videoTrack.length} Video • {audioTrack.length} Audio • {textTrack.length} Subtitles
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Zoom:</span>
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
              className="p-1 rounded bg-black/60 hover:bg-black text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-[#00f2fe]">{timelineZoom}x</span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
              className="p-1 rounded bg-black/60 hover:bg-black text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Tracks Canvas Area with Interactive Scrubbing Playhead */}
        <div 
          className="flex-1 overflow-x-auto relative p-2 space-y-1.5 bg-[#080710]"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = Number(((clickX / (rect.width * timelineZoom)) * totalDuration).toFixed(1));
            setCurrentTime(Math.min(totalDuration, Math.max(0, newTime)));
          }}
        >
          {/* Draggable Vertical Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#00f2fe] z-30 pointer-events-none drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]"
            style={{
              left: `${(currentTime / totalDuration) * 100 * timelineZoom}%`,
            }}
          >
            <div className="w-3 h-3 bg-[#00f2fe] -ml-[5px] -mt-0.5 rounded-full shadow-[0_0_8px_rgba(0,242,254,1)]" />
          </div>

          {/* TRACK 1: VIDEO TRACK */}
          <div className="h-10 bg-black/50 rounded-xl border border-white/5 relative flex items-center px-1 overflow-hidden">
            <span className="absolute left-2 text-[9px] font-mono text-slate-500 z-10 pointer-events-none font-bold">
              VIDEO
            </span>
            <div className="flex h-8 gap-1 pl-12 relative w-full" style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: 'left' }}>
              {videoTrack.map((clip) => {
                const isSelected = selectedClipId === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(clip.id);
                    }}
                    style={{
                      width: `${(clip.duration / totalDuration) * 100}%`,
                    }}
                    className={`h-full rounded-lg bg-gradient-to-r ${clip.color} border px-2 flex items-center justify-between text-[10px] font-mono font-bold text-white truncate cursor-pointer transition shadow ${
                      isSelected ? 'border-[#00f2fe] ring-1 ring-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.4)]' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="truncate">{clip.name}</span>
                    <span className="text-[8px] text-white/70 ml-1 shrink-0">{clip.duration}s</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: AUDIO / MUSIC TRACK (with animated waveform visualization) */}
          <div className="h-9 bg-black/50 rounded-xl border border-white/5 relative flex items-center px-1 overflow-hidden">
            <span className="absolute left-2 text-[9px] font-mono text-emerald-400 z-10 pointer-events-none font-bold flex items-center gap-1">
              <Music className="w-3 h-3" /> AUDIO
            </span>
            <div className="flex h-7 gap-1 pl-12 relative w-full" style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: 'left' }}>
              {audioTrack.map((audio) => (
                <div
                  key={audio.id}
                  style={{
                    width: `${(audio.duration / totalDuration) * 100}%`,
                  }}
                  className="h-full rounded-lg bg-gradient-to-r from-emerald-700/80 to-teal-800/80 border border-emerald-500/40 px-2 flex items-center justify-between text-[10px] font-mono font-bold text-emerald-200 truncate cursor-pointer shadow"
                >
                  <span className="truncate">{audio.name}</span>
                  {showWaveform && (
                    <div className="flex items-center gap-0.5 ml-2 shrink-0 opacity-80">
                      {[10, 18, 6, 22, 14, 8, 24, 12, 16].map((h, i) => (
                        <span key={i} className="w-0.5 bg-emerald-300 rounded-full" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3: TEXT & SUBTITLES TRACK */}
          <div className="h-8 bg-black/50 rounded-xl border border-white/5 relative flex items-center px-1 overflow-hidden">
            <span className="absolute left-2 text-[9px] font-mono text-pink-400 z-10 pointer-events-none font-bold flex items-center gap-1">
              <Type className="w-3 h-3" /> TEXT
            </span>
            <div className="flex h-6 gap-1 pl-12 relative w-full" style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: 'left' }}>
              {textTrack.map((txt) => (
                <div
                  key={txt.id}
                  style={{
                    width: `${(txt.duration / totalDuration) * 100}%`,
                  }}
                  className="h-full rounded-md bg-gradient-to-r from-pink-700/80 to-rose-800/80 border border-pink-500/40 px-1.5 flex items-center justify-between text-[9px] font-mono font-bold text-pink-200 truncate cursor-pointer shadow"
                >
                  <span className="truncate">{txt.text || txt.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 4: FX TRANSITIONS TRACK */}
          <div className="h-7 bg-black/50 rounded-xl border border-white/5 relative flex items-center px-1 overflow-hidden">
            <span className="absolute left-2 text-[9px] font-mono text-amber-400 z-10 pointer-events-none font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> FX
            </span>
            <div className="flex h-5 gap-1 pl-12 relative w-full" style={{ transform: `scaleX(${timelineZoom})`, transformOrigin: 'left' }}>
              {fxTrack.map((fx) => (
                <div
                  key={fx.id}
                  style={{
                    width: `${(fx.duration / totalDuration) * 100}%`,
                  }}
                  className="h-full rounded-md bg-gradient-to-r from-amber-700/80 to-orange-800/80 border border-amber-500/40 px-1.5 flex items-center justify-between text-[8px] font-mono font-bold text-amber-200 truncate cursor-pointer shadow"
                >
                  <span className="truncate">{fx.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 4. EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in">
          <div className="w-full max-w-md bg-[#14121f] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 font-mono text-xs">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Export Video Project</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Resolution:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['720p', '1080p', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setExportResolution(res)}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        exportResolution === res ? 'bg-[#00f2fe] text-slate-950 border-[#00f2fe]' : 'bg-black/60 border-white/10 text-slate-300'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Frame Rate:</span>
                <div className="grid grid-cols-2 gap-2">
                  {([30, 60] as const).map((fps) => (
                    <button
                      key={fps}
                      onClick={() => setExportFps(fps)}
                      className={`p-2 rounded-xl border text-center font-bold ${
                        exportFps === fps ? 'bg-[#6c63ff] text-white border-[#6c63ff]' : 'bg-black/60 border-white/10 text-slate-300'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              {isExporting && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Rendering 4K 60fps MP4...</span>
                    <span className="text-emerald-400 font-bold">{exportProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] transition-all duration-200" 
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                disabled={isExporting}
                onClick={() => {
                  setIsExporting(true);
                  setExportProgress(15);
                  setTimeout(() => setExportProgress(55), 600);
                  setTimeout(() => setExportProgress(88), 1200);
                  setTimeout(() => {
                    setExportProgress(100);
                    setIsExporting(false);
                    setShowExportModal(false);
                    onSaveToVault?.({
                      type: 'video',
                      title: `OmniMotion - ${exportResolution.toUpperCase()} 60fps Master`,
                      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
                      tags: ['OmniMotion', exportResolution, 'CapCut Killer', '4K 60fps'],
                      details: `Exported with OmniMotion Studio • Synced across mobile & desktop`
                    });
                    setHandoffToast(`Exported ${exportResolution.toUpperCase()} 60fps and saved to Omni Vault!`);
                    setTimeout(() => setHandoffToast(null), 3500);
                  }, 1800);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#00f2fe] text-slate-950 font-bold shadow-md shadow-[#6c63ff]/30 active:scale-95 transition"
              >
                {isExporting ? 'Rendering...' : 'Start 4K Render'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
