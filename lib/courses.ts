import {
  Activity, Zap, Dumbbell, Shield, Bike, Baby, Music, Disc, Theater,
  type LucideIcon,
} from 'lucide-react'

export interface CourseData {
  key: string
  slug: string
  icon: LucideIcon
  color: string
  accent: string
  iconColor: string
  category: 'fitness' | 'dance'
}

export const fitnessCourses: CourseData[] = [
  { key: 'pilates', slug: 'pilates', icon: Activity, color: 'from-rose-500/20 to-red-600/20', accent: 'bg-rose-500/10 border-rose-500/20', iconColor: 'text-rose-500', category: 'fitness' },
  { key: 'kickboxing', slug: 'kickboxing', icon: Zap, color: 'from-orange-500/20 to-red-600/20', accent: 'bg-orange-500/10 border-orange-500/20', iconColor: 'text-orange-500', category: 'fitness' },
  { key: 'circuit', slug: 'circuit', icon: Dumbbell, color: 'from-red-500/20 to-rose-600/20', accent: 'bg-red-500/10 border-red-500/20', iconColor: 'text-red-500', category: 'fitness' },
  { key: 'lowImpact', slug: 'low-impact', icon: Shield, color: 'from-pink-500/20 to-red-600/20', accent: 'bg-pink-500/10 border-pink-500/20', iconColor: 'text-pink-500', category: 'fitness' },
  { key: 'spinning', slug: 'spinning', icon: Bike, color: 'from-red-600/20 to-orange-500/20', accent: 'bg-red-600/10 border-red-600/20', iconColor: 'text-red-600', category: 'fitness' },
  { key: 'posturale', slug: 'posturale', icon: Activity, color: 'from-rose-400/20 to-red-500/20', accent: 'bg-rose-400/10 border-rose-400/20', iconColor: 'text-rose-400', category: 'fitness' },
]

export const danceCourses: CourseData[] = [
  { key: 'propedeutica', slug: 'propedeutica', icon: Baby, color: 'from-violet-500/20 to-purple-600/20', accent: 'bg-violet-500/10 border-violet-500/20', iconColor: 'text-violet-400', category: 'dance' },
  { key: 'modernDance', slug: 'modern-dance', icon: Music, color: 'from-fuchsia-500/20 to-pink-600/20', accent: 'bg-fuchsia-500/10 border-fuchsia-500/20', iconColor: 'text-fuchsia-400', category: 'dance' },
  { key: 'hipHop', slug: 'hip-hop', icon: Disc, color: 'from-purple-500/20 to-violet-600/20', accent: 'bg-purple-500/10 border-purple-500/20', iconColor: 'text-purple-400', category: 'dance' },
  { key: 'choreography', slug: 'choreography', icon: Theater, color: 'from-pink-500/20 to-fuchsia-600/20', accent: 'bg-pink-500/10 border-pink-500/20', iconColor: 'text-pink-400', category: 'dance' },
]

export const allCourses: CourseData[] = [...fitnessCourses, ...danceCourses]

export function getCourseBySlug(slug: string): CourseData | undefined {
  return allCourses.find(c => c.slug === slug)
}

export function getRelatedCourses(course: CourseData, limit = 3): CourseData[] {
  return allCourses
    .filter(c => c.key !== course.key && c.category === course.category)
    .slice(0, limit)
}

export const levelColors: Record<string, string> = {
  'Tutti i Livelli': 'bg-green-500/10 text-green-400 border-green-500/20',
  'All Levels': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Alle Level': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Intermedio': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Intermediate': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Mittel': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Principiante': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Beginner': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Anfänger': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Bambini': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Kids': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Kinder': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}
