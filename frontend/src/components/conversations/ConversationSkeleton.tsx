const ConversationSkeleton = () => {
  return (
    <div className="border-base-300 animate-pulse border-b p-4">
      <div className="flex items-start space-x-3">
        {/* Avatar skeleton */}
        <div className="bg-base-300 h-12 w-12 rounded-full"></div>

        <div className="min-w-0 flex-1">
          {/* Name and time skeleton */}
          <div className="mb-1 flex items-center justify-between">
            <div className="bg-base-300 h-4 w-24 rounded"></div>
            <div className="bg-base-300 h-3 w-16 rounded"></div>
          </div>

          {/* Message content skeleton */}
          <div className="bg-base-300 mb-2 h-3 w-full rounded"></div>
          <div className="bg-base-300 mb-2 h-3 w-3/4 rounded"></div>

          {/* Status badges skeleton */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-base-300 h-5 w-16 rounded-full"></div>
              <div className="bg-base-300 h-5 w-20 rounded-full"></div>
            </div>
            <div className="bg-base-300 h-4 w-4 rounded"></div>
          </div>

          {/* Agent name skeleton */}
          <div className="bg-base-300 h-3 w-20 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default ConversationSkeleton
