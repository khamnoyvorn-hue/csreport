/**
 * Translation dictionary supporting Khmer (Default) and English.
 */

export const translations = {
  km: {
    // Header & App Info
    appTitle: 'របាយការណ៍ CS Performance',
    miniApp: 'Mini App',
    reloadDefault: 'ទាញយកឡើងវិញ',
    uploadExcel: 'បញ្ចូល Excel',
    dailyReport: 'របាយការណ៍ប្រចាំថ្ងៃ',

    // Tabs
    overviewAnalytics: 'ផ្ទាំងសង្ខេបវិភាគ',
    csLeaderboard: 'តារាងចំណាត់ថ្នាក់ CS',
    memberDrilldown: 'ព័ត៌មានលម្អិតសមាជិក',
    telegramShare: 'ចែករំលែក Telegram',

    // Short Mobile Tab Labels
    navOverview: 'ផ្ទាំងវិភាគ',
    navLeaderboard: 'ចំណាត់ថ្នាក់',
    navMembers: 'សមាជិក',
    navShare: 'ចែករំលែក',

    // KPI Cards
    totalRefill: 'ដាក់ប្រាក់សរុប (Refill)',
    totalWithdraw: 'ប្រាក់ដកសរុប (Withdraw)',
    netResult: 'ផលចំណេញ/ខាត សរុប',
    activePlayers: 'អ្នកលេងសកម្ម',
    totalAccounts: 'សរុប',
    activeOverTotalLabel: 'សរុប / អ្នកលេង',
    margin: 'រឹមចំណេញ',
    refillDesc: 'ប្រាក់ដាក់សរុបដែលបានប្រមូលតាម CS',
    withdrawDesc: 'ប្រាក់ដែលបានបើកជូនសរុប',
    activeRatio: 'សកម្មធៀបនឹងអាខោនសរុប',

    // Charts
    chartTitleBar: 'ការប្រៀបធៀប CS Performance',
    chartSubBar: 'ដាក់ប្រាក់ vs ប្រាក់ដក vs លទ្ធផលសរុប តាម CS',
    chartTitleDoughnut: 'ចំណែកប្រាក់ដាក់តាម CS',
    chartSubDoughnut: 'ភាគរយប្រាក់ដាក់ដែលប្រមូលបានតាម CS',
    others: 'ផ្សេងៗ',

    // Table & Filters
    leaderboardTitle: 'តារាងចំណាត់ថ្នាក់ CS',
    leaderboardSub: 'បង្ហាញចំនួន Customer Service ទាំងអស់',
    searchCs: 'ស្វែងរកឈ្មោះ CS...',
    allCs: 'CS ទាំងអស់',
    profitable: 'ចំណេញ',
    lossOnly: 'ខាត',
    rank: 'ថ្នាក់',
    csName: 'ឈ្មោះ CS',
    accounts: 'សរុប',
    active: 'អ្នកលេង',
    refill: 'ដាក់ប្រាក់',
    withdraw: 'ប្រាក់ដក',
    netResultCol: 'លទ្ធផលសរុប',
    status: 'ស្ថានភាព',
    profit: 'ចំណេញ',
    loss: 'ខាត',
    fullMemberView: 'មើលសមាជិកពេញលេញ →',
    noMembers: 'មិនទាន់មានទិន្នន័យសមាជិកឡើយ។',

    // Member View
    memberTitle: 'ព័ត៌មានលម្អិតប្រតិបត្តិការសមាជិក',
    memberSub: 'បង្ហាញអាខោនសមាជិក',
    searchMember: 'ស្វែងរកឈ្មោះសមាជិក...',
    activeOnly: 'តែសកម្ម',
    allCsAgents: 'CS ទាំងអស់',
    username: 'ឈ្មោះសមាជិក',
    assignedCs: 'CS គ្រប់គ្រង',
    transCount: 'ប្រតិបត្តិការ',
    idle: 'មិនសកម្ម',

    // Telegram Exporter
    exportTitle: 'សេចក្តីសង្ខេប Telegram Generator',
    exportSub: '១-ចុច ដើម្បីចម្លងផ្ញើចូល Telegram Channel ឬ Group',
    copySummary: 'ចម្លងសេចក្តីសង្ខេប',
    copied: 'បានចម្លងរួចរាល់! 📋',
    tgReportHeader: '📊 របាយការណ៍ CS PERFORMANCE REPORT',
    tgRefill: '💵 ដាក់ប្រាក់សរុប:',
    tgWithdraw: '💸 ប្រាក់ដកសរុប:',
    tgNetResult: '📈 លទ្ធផលសរុប:',
    tgActivePlayers: '👥 អ្នកលេងសកម្ម:',
    tgLeaderboardHeader: '🏆 តារាងចំណាត់ថ្នាក់ CS កំពូល',

    // Uploader Modal
    uploadTitle: 'បញ្ចូលឯកសារ Excel របាយការណ៍ CS',
    uploadSub: 'ជ្រើសរើស ឬ ទាញទម្លាក់ឯកសារ Excel (.xlsx) ដើម្បីធ្វើបច្ចុប្បន្នភាពទិន្នន័យភ្លាមៗ',
    clickOrDrag: 'ចុច ឬ ទាញទម្លាក់ឯកសារ Excel ទីនេះ',
    supportFormats: 'គាំទ្រទម្រង់ .xlsx និង .xls (Report.xlsx schema)',
    cancel: 'បោះបង់',
    invalidFile: 'សូមជ្រើសរើសឯកសារ Excel ដែលត្រឹមត្រូវ (.xlsx ឬ .xls)'
  },
  en: {
    // Header & App Info
    appTitle: 'CS Performance Report',
    miniApp: 'Mini App',
    reloadDefault: 'Reload Default',
    uploadExcel: 'Upload Excel',
    dailyReport: 'Daily Report',

    // Tabs
    overviewAnalytics: 'Overview Analytics',
    csLeaderboard: 'CS Leaderboard',
    memberDrilldown: 'Member Drilldown',
    telegramShare: 'Telegram Share',

    // Short Mobile Tab Labels
    navOverview: 'Overview',
    navLeaderboard: 'Ranking',
    navMembers: 'Members',
    navShare: 'Share',

    // KPI Cards
    totalRefill: 'Total Refill (Deposit)',
    totalWithdraw: 'Total Withdraw',
    netResult: 'Net Profit / Result',
    activePlayers: 'Active Players',
    totalAccounts: 'total',
    activeOverTotalLabel: 'Total / Players',
    margin: 'Margin',
    refillDesc: 'Total deposits collected across CS',
    withdrawDesc: 'Total payouts processed',
    activeRatio: 'Active ratio over total accounts',

    // Charts
    chartTitleBar: 'Top CS Performance Comparison',
    chartSubBar: 'Refill vs Withdraw vs Net Profit per CS Agent',
    chartTitleDoughnut: 'CS Deposit Share Distribution',
    chartSubDoughnut: 'Total Refill contribution percentage by CS',
    others: 'Others',

    // Table & Filters
    leaderboardTitle: 'CS Performance Leaderboard',
    leaderboardSub: 'Showing all Customer Service agents',
    searchCs: 'Search CS...',
    allCs: 'All CS',
    profitable: 'Profitable',
    lossOnly: 'Loss',
    rank: 'Rank',
    csName: 'CS Name',
    accounts: 'Total',
    active: 'Players',
    refill: 'Refill',
    withdraw: 'Withdraw',
    netResultCol: 'Net Result',
    status: 'Status',
    profit: 'Profit',
    loss: 'Loss',
    fullMemberView: 'Open in Full Member View →',
    noMembers: 'No individual member rows recorded.',

    // Member View
    memberTitle: 'Member Transaction Breakdown',
    memberSub: 'Showing member accounts',
    searchMember: 'Search Username...',
    activeOnly: 'Active Only',
    allCsAgents: 'All CS Agents',
    username: 'Username',
    assignedCs: 'Assigned CS',
    transCount: 'Trans Count',
    idle: 'Idle',

    // Telegram Exporter
    exportTitle: 'Telegram Summary Generator',
    exportSub: '1-Click summary ready to paste into Telegram channels or groups',
    copySummary: 'Copy Summary',
    copied: 'Copied to Clipboard! 📋',
    tgReportHeader: '📊 CS PERFORMANCE REPORT',
    tgRefill: '💵 Refill Total:',
    tgWithdraw: '💸 Withdraw Total:',
    tgNetResult: '📈 Net Result:',
    tgActivePlayers: '👥 Active Players:',
    tgLeaderboardHeader: '🏆 TOP CS LEADERBOARD',

    // Uploader Modal
    uploadTitle: 'Upload CS Excel Report',
    uploadSub: 'Select or drag & drop any Customer Service .xlsx report file to update all dashboard analytics instantly.',
    clickOrDrag: 'Click or drag Excel file here',
    supportFormats: 'Supports .xlsx and .xls formats (Report.xlsx schema)',
    cancel: 'Cancel',
    invalidFile: 'Please select a valid Excel file (.xlsx or .xls)'
  }
};
