import { Toaster } from "@/components/ui/toaster"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding/Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 relative">
        <div className="flex flex-col justify-center items-start p-12 max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">
              KAMP KI
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Volg je Life of Ki reis met dagelijkse inzichten en gepersonaliseerde coaching begeleiding.
            </p>
          </div>
          
          <div className="space-y-6 text-muted-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Dagelijkse tracking</p>
                <p className="text-sm">Monitor humeur, slaap, voeding en activiteiten</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Wekelijkse inzichten</p>
                <p className="text-sm">Krijg gepersonaliseerde feedback en coaching opdrachten</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Voortgang visualisatie</p>
                <p className="text-sm">Zie je Life of Ki reis met duidelijke grafieken en trends</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50"></div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              KAMP KI
            </h1>
            <p className="text-muted-foreground">
              Je persoonlijke Life of Ki begeleider
            </p>
          </div>
          
          {children}
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}