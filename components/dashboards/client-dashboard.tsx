"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ClientMessageBox from "@/components/common/ClientMessageBox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, Camera, Clock, DollarSign, FolderOpen, MessageSquare, TrendingUp, CreditCard, Calendar, Loader2, Phone } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ClientProjectsManagement from "@/components/management/client-projects"
import ClientPaymentsManagement from "@/components/management/client-payments"
import ClientSettingsManagement from "@/components/management/client-settings"
import { useClient } from "@/contexts/ClientContext"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

// Types
type Project = {
  id: string
  name: string
  progress: number
  status: 'On Track' | 'Delayed' | 'Nearly Complete'
  budget: string
  completion: string
  manager: string
  location: string
  lastUpdate: string
}

type Update = {
  id: string
  project: string
  update: string
  date: string
  photos: number
  type: 'milestone' | 'progress' | 'schedule'
}

type StatCard = {
  id: string
  title: string
  value: string
  icon: React.ElementType
  color: string
  bgColor: string
}

// Constants
const PROJECT_STATS: StatCard[] = [
  {
    id: 'active-projects',
    title: 'Active Projects',
    value: '3',
    icon: FolderOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'total-investment',
    title: 'Total Investment',
    value: '$1.2M',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'avg-progress',
    title: 'Avg. Progress',
    value: '68%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'pending-reviews',
    title: 'Pending Reviews',
    value: '2',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
]

const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Luxury Villa Construction',
    progress: 75,
    status: 'On Track',
    budget: '$450,000',
    completion: 'Dec 2024',
    manager: 'John Smith',
    location: 'Beverly Hills, CA',
    lastUpdate: '2 hours ago',
  },
  {
    id: '2',
    name: 'Office Building Renovation',
    progress: 45,
    status: 'Delayed',
    budget: '$280,000',
    completion: 'Feb 2025',
    manager: 'Sarah Johnson',
    location: 'Downtown LA',
    lastUpdate: '1 day ago',
  },
  {
    id: '3',
    name: 'Warehouse Expansion',
    progress: 90,
    status: 'Nearly Complete',
    budget: '$320,000',
    completion: 'Nov 2024',
    manager: 'Mike Davis',
    location: 'Industrial District',
    lastUpdate: '3 hours ago',
  },
]

const UPDATES: Update[] = [
  {
    id: '1',
    project: 'Luxury Villa Construction',
    update: 'Foundation work completed. Starting with ground floor construction.',
    date: '2 hours ago',
    photos: 3,
    type: 'milestone',
  },
  {
    id: '2',
    project: 'Office Building Renovation',
    update: 'Electrical wiring installation in progress. 60% completed.',
    date: '1 day ago',
    photos: 5,
    type: 'progress',
  },
  {
    id: '3',
    project: 'Warehouse Expansion',
    update: 'Final inspections scheduled for next week.',
    date: '2 days ago',
    photos: 2,
    type: 'schedule',
  },
]

// Components
const StatCard = ({ title, value, icon: Icon, color, bgColor }: StatCard) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-500 mt-1">Updated just now</p>
    </CardContent>
  </Card>
)

const ProjectCard = ({ project }: { project: Project }) => {
  const statusColors = {
    'On Track': 'bg-green-100 text-green-800 border-green-200',
    'Delayed': 'bg-red-100 text-red-800 border-red-200',
    'Nearly Complete': 'bg-blue-100 text-blue-800 border-blue-200',
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
          <p className="text-sm text-gray-500">{project.location}</p>
        </div>
        <Badge className={statusColors[project.status]}>{project.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div><span className="font-medium">Budget:</span> {project.budget}</div>
        <div><span className="font-medium">Completion:</span> {project.completion}</div>
        <div><span className="font-medium">Manager:</span> {project.manager}</div>
        <div><span className="font-medium">Progress:</span> {project.progress}%</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500">Last update: {project.lastUpdate}</span>
        <Button variant="outline" size="sm">View Details</Button>
      </div>
    </div>
  )
}

const UpdateCard = ({ update }: { update: Update }) => {
  const updateIcons = {
    milestone: <Calendar className="w-4 h-4 text-blue-600" />,
    progress: <TrendingUp className="w-4 h-4 text-green-600" />,
    schedule: <Clock className="w-4 h-4 text-orange-600" />
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="mt-1">{updateIcons[update.type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm mb-1">{update.project}</h4>
          <p className="text-sm text-gray-600 mb-2">{update.update}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{update.date}</span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Camera className="w-3 h-3" />
              {update.photos}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick
}: {
  title: string
  description: string
  icon: React.ElementType
  color: string
  onClick: () => void
}) => (
  <Card
    className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
    onClick={onClick}
  >
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <div className={`p-2 ${color} rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button className="w-full">
        {title.startsWith('View') ? title : `Go to ${title}`}
      </Button>
    </CardContent>
  </Card>
)

// Main Component
export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const router = useRouter()
  const { data: session } = useSession()
  const { client, isLoading, error } = useClient()

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        return (
          <>
            <ClientProjectsManagement />
          </>
        )
      case 'payments':
        return <ClientPaymentsManagement />
      case 'message':
        // Use client._id as the single source of truth for conversationId
        return (
          <ClientMessageBox
            title={client?.name ? `${client.name}` : 'Super Admin'}
            conversationId={client?._id || 'guest-chat'}
          />
        )
      case 'settings':
        return <ClientSettingsManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8 bg-white rounded-lg border">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading your dashboard...</span>
              </div>
            ) : client ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome back, {client.name?.split(' ')[0] || 'Valued Client'}!
                    </h1>
                    <p className="text-gray-600">
                      {client.company ? `Here's an overview of your projects at ${client.company}.` : "Here's an overview of your construction projects and recent activity."}
                    </p>
                  </div>
                  {client.avatar && (
                    <div className="h-16 w-16 rounded-full bg-white border-2 border-blue-200 overflow-hidden">
                      <img
                        src={client.avatar}
                        alt={client.name || 'Client'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Client Info Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {client.email && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {client.email}
                    </Badge>
                  )}
                  {client.phone && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </Badge>
                  )}
                  {client.status && (
                    <Badge
                      variant={client.status.toLowerCase() === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {client.status}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
                <p className="text-gray-600">Please complete your profile to get started.</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setActiveSection('settings')}
                >
                  Go to Settings
                </Button>
              </div>
            )}

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROJECT_STATS.map((stat) => {
                // Update stats based on client data if available
                const statWithClientData = { ...stat };

                if (client) {
                  switch (stat.id) {
                    case 'active-projects':
                      statWithClientData.value = client.projectTotalAmount ? '3' : '0';
                      break;
                    case 'total-investment':
                      statWithClientData.value = `$${client.projectTotalAmount?.toLocaleString() || '0'}`;
                      break;
                  }
                }

                return <StatCard key={statWithClientData.id} {...statWithClientData} />;
              })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* My Projects */}
              <div className="xl:col-span-2">
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">My Projects</CardTitle>
                        <CardDescription>Overview of your actijhkhkhve construction projects</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveSection('projects')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {PROJECTS.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Updates */}
              <div>
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Updates</CardTitle>
                    <CardDescription>Latest progress from your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {UPDATES.map((update) => (
                        <UpdateCard key={update.id} update={update} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionCard
                title="Submit Feedback"
                description="Share your thoughts on project progress and quality"
                icon={MessageSquare}
                color="bg-blue-50 text-blue-600"
                onClick={() => setActiveSection('feedback')}
              />

              <QuickActionCard
                title="Payment Status"
                description="View payment schedules and transaction history"
                icon={CreditCard}
                color="bg-green-50 text-green-600"
                onClick={() => setActiveSection('payments')}
              />

              <QuickActionCard
                title="Notifications"
                description="Stay updated with project notifications and alerts"
                icon={Bell}
                color="bg-purple-50 text-purple-600"
                onClick={() => setActiveSection('notifications')}
              />
            </div>
          </div>
        )
    }
  }

  return (
    <DashboardLayout
      userRole="client"
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
    >
      {renderContent()}
    </DashboardLayout>
  )
}