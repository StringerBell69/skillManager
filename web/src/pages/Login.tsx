import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome to <span className="text-primary">SkillManager</span>
          </h1>
          <p className="text-muted-foreground">Sign in to manage your AI agents</p>
        </div>
        
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/signup" 
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              card: "bg-card border border-border shadow-sm",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border-border text-foreground hover:bg-secondary",
              socialButtonsBlockButtonText: "font-semibold",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-background border-border text-foreground focus:ring-primary focus:border-primary",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
            }
          }}
        />
      </div>
    </div>
  );
}
