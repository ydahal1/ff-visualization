// Load and analyze the game data to find returning users
import { games } from './src/data/game-data.js';

// Group games by user
const userGames = {};
games.forEach(game => {
  if (!userGames[game.creatorId]) {
    userGames[game.creatorId] = {
      lastName: game.creatorLastName,
      games: []
    };
  }
  userGames[game.creatorId].games.push(game);
});

// Find users who created games on multiple different dates
const returningUsers = [];

Object.keys(userGames).forEach(creatorId => {
  const userGameList = userGames[creatorId].games;
  
  // Extract unique dates (without time)
  const uniqueDates = new Set(
    userGameList.map(game => game.createdAt.split(',')[0])
  );
  
  if (uniqueDates.size > 1) {
    const sortedDates = Array.from(uniqueDates).sort();
    returningUsers.push({
      creatorId: creatorId,
      lastName: userGames[creatorId].lastName,
      totalGames: userGameList.length,
      uniqueDates: Array.from(uniqueDates),
      dateRange: {
        first: sortedDates[0],
        last: sortedDates[sortedDates.length - 1]
      },
      gamesPerDate: {}
    });
    
    // Count games per date
    const lastUser = returningUsers[returningUsers.length - 1];
    uniqueDates.forEach(date => {
      lastUser.gamesPerDate[date] = 
        userGameList.filter(game => game.createdAt.split(',')[0] === date).length;
    });
  }
});

// Sort by total games created
returningUsers.sort((a, b) => b.totalGames - a.totalGames);

console.log('=== RETURNING USERS ANALYSIS ===');
console.log('Users who came back and created games on different dates:', returningUsers.length);
console.log('\nTop returning users:');

returningUsers.slice(0, 10).forEach((user, index) => {
  console.log(`${index + 1}. ${user.lastName} (ID: ${user.creatorId})`);
  console.log(`   Total Games: ${user.totalGames}`);
  console.log(`   Active Dates: ${user.uniqueDates.length} (${user.dateRange.first} to ${user.dateRange.last})`);
  console.log(`   Games per date: ${JSON.stringify(user.gamesPerDate)}`);
  console.log('');
});

// Create summary stats
const totalUsers = Object.keys(userGames).length;
const singleDayUsers = totalUsers - returningUsers.length;

console.log('=== SUMMARY STATISTICS ===');
console.log(`Total unique users: ${totalUsers}`);
console.log(`Single-day users: ${singleDayUsers} (${(singleDayUsers/totalUsers*100).toFixed(1)}%)`);
console.log(`Returning users: ${returningUsers.length} (${(returningUsers.length/totalUsers*100).toFixed(1)}%)`);

// Date range analysis
const maxDates = Math.max(...returningUsers.map(u => u.uniqueDates.length));
console.log(`Max dates by single user: ${maxDates}`);

const avgGamesPerReturningUser = returningUsers.reduce((sum, u) => sum + u.totalGames, 0) / returningUsers.length;
console.log(`Average games per returning user: ${avgGamesPerReturningUser.toFixed(1)}`);

// Export for visualization
export { returningUsers, userGames };