interface EnvConfig {
  supabase: {
    url: string
    anonKey: string
  }
  api: {
    baseUrl: string
  }
  mpesa: {
    callbackUrl: string
  }
  app: {
    name: string
    url: string
  }
}

export const env: EnvConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  },
  mpesa: {
    callbackUrl: import.meta.env.VITE_MPESA_CALLBACK_URL,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME,
    url: import.meta.env.VITE_APP_URL,
  },
}

// Validate environment variables
const validateEnv = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_API_BASE_URL',
    'VITE_MPESA_CALLBACK_URL',
  ]

  for (const variable of required) {
    if (!import.meta.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`)
    }
  }
}

validateEnv()