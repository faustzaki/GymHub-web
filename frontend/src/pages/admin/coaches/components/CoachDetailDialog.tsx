// ============================================================
// CoachDetailDialog — Modal pop-up detail lengkap coach
// ============================================================

import { useCoachManagement } from '@/hooks/useCoachManagement';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Phone,
  Calendar,
  User,
  Award,
  FileText,
  Dumbbell,
} from 'lucide-react';

/** SVG komponen untuk ikon Instagram (lucide-react tidak menyediakan brand icons) */
function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/** SVG komponen untuk ikon YouTube */
function YouTubeIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

/** SVG komponen untuk ikon TikTok */
function TikTokIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function CoachDetailDialog() {
  const { isDetailOpen, setIsDetailOpen, selectedCoach } = useCoachManagement();

  if (!selectedCoach) return null;

  const hasSocialMedia =
    selectedCoach.social_media.instagram ||
    selectedCoach.social_media.youtube ||
    selectedCoach.social_media.tiktok;

  const hasCertifications = selectedCoach.sertifikasi.length > 0;

  return (
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Coach</DialogTitle>
          <DialogDescription className="sr-only">
            Informasi lengkap profil coach
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header: Avatar + Nama + Status */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedCoach.foto_url} alt={selectedCoach.nama} />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {getInitials(selectedCoach.nama)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{selectedCoach.nama}</h3>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {selectedCoach.spesialisasi.map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs font-normal">
                    {spec}
                  </Badge>
                ))}
              </div>
              <Badge
                variant={selectedCoach.status === 'Aktif' ? 'default' : 'destructive'}
                className={
                  selectedCoach.status === 'Aktif'
                    ? 'bg-green-500/15 text-green-500 border-green-500/20 mt-1'
                    : 'bg-red-500/15 text-red-500 border-red-500/20 mt-1'
                }
              >
                {selectedCoach.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5" /> Bio
            </h4>
            <p className="text-sm leading-relaxed">{selectedCoach.bio}</p>
          </div>

          <Separator />

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </h4>
              <p className="text-sm">{selectedCoach.email}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> No. Handphone
              </h4>
              <p className="text-sm">{selectedCoach.no_hp}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Tanggal Lahir
              </h4>
              <p className="text-sm">
                {new Date(selectedCoach.tanggal_lahir).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <User className="h-3 w-3" /> Jenis Kelamin
              </h4>
              <p className="text-sm">{selectedCoach.jenis_kelamin}</p>
            </div>
          </div>

          {/* Sertifikasi */}
          {hasCertifications && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" /> Sertifikasi
                </h4>
                <div className="space-y-1.5">
                  {selectedCoach.sertifikasi.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2"
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Social Media */}
          {hasSocialMedia && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Social Media</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedCoach.social_media.instagram && (
                    <div className="flex items-center gap-1.5 text-sm bg-muted/50 rounded-md px-3 py-1.5">
                      <InstagramIcon size={14} className="text-pink-500" />
                      <span>{selectedCoach.social_media.instagram}</span>
                    </div>
                  )}
                  {selectedCoach.social_media.youtube && (
                    <div className="flex items-center gap-1.5 text-sm bg-muted/50 rounded-md px-3 py-1.5">
                      <YouTubeIcon size={14} className="text-red-500" />
                      <span>{selectedCoach.social_media.youtube}</span>
                    </div>
                  )}
                  {selectedCoach.social_media.tiktok && (
                    <div className="flex items-center gap-1.5 text-sm bg-muted/50 rounded-md px-3 py-1.5">
                      <TikTokIcon size={14} />
                      <span>{selectedCoach.social_media.tiktok}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ID & Tanggal Bergabung */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium mb-0.5">ID Coach</p>
              <p className="font-mono">{selectedCoach.id}</p>
            </div>
            <div>
              <p className="font-medium mb-0.5">Bergabung</p>
              <p>
                {new Date(selectedCoach.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
