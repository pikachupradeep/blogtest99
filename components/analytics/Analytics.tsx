// components/analytics-dashboard.tsx
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiBarChart2, FiBook, FiUser, FiShare2 } from 'react-icons/fi';

export default function AnalyticsDashboard() {
  // Dummy data for blog analytics
  const analyticsData = {
    overview: {
      totalVisitors: 12458,
      totalPageViews: 45231,
      averageTime: '3:45',
      bounceRate: '42%'
    },
    trafficSources: [
      { source: 'Organic Search', visitors: 6542, percentage: 52 },
      { source: 'Social Media', visitors: 3124, percentage: 25 },
      { source: 'Direct', visitors: 1874, percentage: 15 },
      { source: 'Referral', visitors: 918, percentage: 8 }
    ],
    topPosts: [
      { title: 'Getting Started with Next.js', views: 3245, reads: 2890 },
      { title: 'React Best Practices 2024', views: 2987, reads: 2543 },
      { title: 'TypeScript for Beginners', views: 2765, reads: 2312 },
      { title: 'CSS Grid vs Flexbox', views: 2432, reads: 1987 }
    ],
    readerStats: {
      totalReaders: 8456,
      returningReaders: 3124,
      newReaders: 5332,
      avgReadsPerUser: 2.3
    },
    authorPerformance: [
      { name: 'Sarah Johnson', posts: 12, totalViews: 15432, avgReadRate: '78%' },
      { name: 'Mike Chen', posts: 8, totalViews: 9876, avgReadRate: '82%' },
      { name: 'Emma Davis', posts: 6, totalViews: 7654, avgReadRate: '75%' },
      { name: 'Alex Rivera', posts: 4, totalViews: 5432, avgReadRate: '71%' }
    ],
    monthlyGrowth: [
      { month: 'Jan', visitors: 8542, posts: 8 },
      { month: 'Feb', visitors: 9234, posts: 10 },
      { month: 'Mar', visitors: 10234, posts: 12 },
      { month: 'Apr', visitors: 11245, posts: 9 },
      { month: 'May', visitors: 12458, posts: 11 },
      { month: 'Jun', visitors: 13542, posts: 14 }
    ],
    popularCategories: [
      { name: 'Web Development', views: 18765, posts: 24 },
      { name: 'JavaScript', views: 15432, posts: 18 },
      { name: 'React', views: 13245, posts: 15 },
      { name: 'CSS', views: 9876, posts: 12 },
      { name: 'TypeScript', views: 7654, posts: 8 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-4 dark:bg-gray-900 rounded-lg p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white font-mono">Blog Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 font-mono">Track your blog's performance and reader engagement</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.overview.totalVisitors.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Total Visitors</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-mono">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span>+12.4% from last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.overview.totalPageViews.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Page Views</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <FiEye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-mono">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span>+8.7% from last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.overview.averageTime}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Avg. Time on Site</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-green-600 dark:text-green-400 text-sm font-mono">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span>+2.1% from last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.overview.bounceRate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Bounce Rate</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <FiShare2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-red-600 dark:text-red-400 text-sm font-mono">
              <FiTrendingUp className="w-4 h-4 mr-1" />
              <span>-3.2% from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Traffic Sources</h2>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between font-mono">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500 dark:bg-blue-400' :
                      index === 1 ? 'bg-green-500 dark:bg-green-400' :
                      index === 2 ? 'bg-purple-500 dark:bg-purple-400' : 'bg-orange-500 dark:bg-orange-400'
                    }`}></div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">{source.source}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 dark:text-white font-semibold font-mono">{source.visitors.toLocaleString()}</span>
                    <span className="text-gray-500 dark:text-gray-400 w-12 text-right font-mono">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reader Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Reader Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg font-mono">
                <FiUser className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.readerStats.totalReaders.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Total Readers</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg font-mono">
                <FiUsers className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.readerStats.returningReaders.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Returning Readers</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg font-mono">
                <FiUser className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.readerStats.newReaders.toLocaleString()}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">New Readers</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg font-mono">
                <FiBook className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.readerStats.avgReadsPerUser}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Avg Reads/User</p>
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Top Performing Posts</h2>
            <div className="space-y-4">
              {analyticsData.topPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors font-mono">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm font-mono">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1 font-mono">{post.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{post.reads.toLocaleString()} reads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white font-mono">{post.views.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 font-mono">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Author Performance</h2>
            <div className="space-y-4">
              {analyticsData.authorPerformance.map((author, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors font-mono">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">{author.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{author.posts} posts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white font-mono">{author.totalViews.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{author.avgReadRate} read rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 font-mono">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Popular Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.popularCategories.map((category, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white font-mono">{category.name}</h3>
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FiBook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-mono">{category.views.toLocaleString()} views</span>
                    <span className="text-gray-600 dark:text-gray-400 font-mono">{category.posts} posts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Growth Chart (Simplified) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mt-8 font-mono">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-mono">Monthly Growth</h2>
          <div className="flex items-end justify-between h-48">
            {analyticsData.monthlyGrowth.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1 font-mono">
                <div 
                  className="bg-blue-500 dark:bg-blue-400 rounded-t-lg w-8 mx-auto transition-all hover:bg-blue-600 dark:hover:bg-blue-300"
                  style={{ height: `${(month.visitors / 15000) * 100}%` }}
                ></div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{month.visitors.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{month.month}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{month.posts} posts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}