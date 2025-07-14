declare global {
  var pendingOAuthTokens: Map<string, {
    requestTokenSecret: string
    userId: string
    timestamp: Date
  }> | undefined
}

export {} 