"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useE2EEAuth } from '@/hooks/useE2EEAuth-new'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, BookOpen, Heart, Bookmark } from 'lucide-react'

export default function DashboardPageSD() {
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated, logout } = useE2EEAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sd/login')
      return
    }
    setIsLoading(false)
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/sd')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 auto-sindhi-font">لوڊ ٿي رهيو آهي...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 auto-sindhi-font">
            خوش آمديد، {user?.profile?.name || user?.username || 'صارف'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 auto-sindhi-font">
            توهان جي سندي شاعري جي سفر هتي شروع ٿئي ٿو
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium auto-sindhi-font">ڪل شاعري</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground auto-sindhi-font">
                پنهنجي پهرين شاعري لکڻ شروع ڪريو
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium auto-sindhi-font">پسند</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground auto-sindhi-font">
                شاعري جيڪا توهان کي پسند آهي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium auto-sindhi-font">نشانيون</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground auto-sindhi-font">
                شاعري جيڪا توهان محفوظ ڪئي آهي
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="auto-sindhi-font">جلدي عمل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/sd/timeline')}
                className="h-12 text-right justify-start"
                variant="outline"
              >
                <BookOpen className="mr-3 h-5 w-5" />
                <div className="text-right">
                  <div className="font-medium auto-sindhi-font">شاعري ڏسو</div>
                  <div className="text-sm text-muted-foreground auto-sindhi-font">سندي شاعري جي مجموعي کي ڏسو</div>
                </div>
              </Button>

              <Button 
                onClick={() => router.push('/sd/profile')}
                className="h-12 text-right justify-start"
                variant="outline"
              >
                <User className="mr-3 h-5 w-5" />
                <div className="text-right">
                  <div className="font-medium auto-sindhi-font">پروفائل ڏسو</div>
                  <div className="text-sm text-muted-foreground auto-sindhi-font">پنهنجي اڪائونٽ کي منظم ڪريو</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="text-center">
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <span className="auto-sindhi-font">خارج ٿيو</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
