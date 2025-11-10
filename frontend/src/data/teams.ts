export interface TeamInfo {
  name: string;
  slug: string;
  crestUrl: string;
  aliases?: string[];
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/fc/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');

export const PREMIER_LEAGUE_TEAMS: TeamInfo[] = [
  {
    name: 'Arsenal',
    slug: 'arsenal',
    crestUrl: 'https://crests.football-data.org/57.svg',
  },
  {
    name: 'Aston Villa',
    slug: 'aston-villa',
    crestUrl: 'https://crests.football-data.org/58.svg',
  },
  {
    name: 'Bournemouth',
    slug: 'bournemouth',
    crestUrl: 'https://crests.football-data.org/1044.svg',
    aliases: ['afc bournemouth'],
  },
  {
    name: 'Brentford',
    slug: 'brentford',
    crestUrl: 'https://crests.football-data.org/402.svg',
  },
  {
    name: 'Brighton & Hove Albion',
    slug: 'brighton',
    crestUrl: 'https://crests.football-data.org/397.svg',
    aliases: ['brighton and hove albion', 'brighton hove albion', 'brighton and hove'],
  },
  {
    name: 'Burnley',
    slug: 'burnley',
    crestUrl: 'https://crests.football-data.org/328.svg',
  },
  {
    name: 'Chelsea',
    slug: 'chelsea',
    crestUrl: 'https://crests.football-data.org/61.svg',
  },
  {
    name: 'Crystal Palace',
    slug: 'crystal-palace',
    crestUrl: 'https://crests.football-data.org/354.svg',
  },
  {
    name: 'Everton',
    slug: 'everton',
    crestUrl: 'https://crests.football-data.org/62.svg',
  },
  {
    name: 'Fulham',
    slug: 'fulham',
    crestUrl: 'https://crests.football-data.org/63.svg',
  },
  {
    name: 'Leeds United',
    slug: 'leeds-united',
    crestUrl: 'https://crests.football-data.org/341.svg',
    aliases: ['leeds'],
  },
  {
    name: 'Liverpool',
    slug: 'liverpool',
    crestUrl: 'https://crests.football-data.org/64.svg',
  },
  {
    name: 'Manchester City',
    slug: 'manchester-city',
    crestUrl: 'https://crests.football-data.org/65.svg',
    aliases: ['man city'],
  },
  {
    name: 'Manchester United',
    slug: 'manchester-united',
    crestUrl: 'https://crests.football-data.org/66.svg',
    aliases: ['man united', 'man utd'],
  },
  {
    name: 'Newcastle United',
    slug: 'newcastle-united',
    crestUrl: 'https://crests.football-data.org/67.svg',
    aliases: ['newcastle'],
  },
  {
    name: 'Nottingham Forest',
    slug: 'nottingham-forest',
    crestUrl: 'https://crests.football-data.org/351.svg',
    aliases: ['forest', 'nottm forest'],
  },
  {
    name: 'Sheffield United',
    slug: 'sheffield-united',
    crestUrl: 'https://crests.football-data.org/356.svg',
    aliases: ['sheff utd', 'sheffield utd'],
  },
  {
    name: 'Tottenham Hotspur',
    slug: 'tottenham-hotspur',
    crestUrl: 'https://crests.football-data.org/73.svg',
    aliases: ['tottenham', 'spurs'],
  },
  {
    name: 'West Ham United',
    slug: 'west-ham-united',
    crestUrl: 'https://crests.football-data.org/563.svg',
    aliases: ['west ham'],
  },
  {
    name: 'Wolverhampton Wanderers',
    slug: 'wolves',
    crestUrl: 'https://crests.football-data.org/76.svg',
    aliases: ['wolverhampton', 'wolverhampton wanderers'],
  },
];

export const TEAM_BY_SLUG = new Map(
  PREMIER_LEAGUE_TEAMS.map((team) => [team.slug, team])
);

export const TEAM_SYNONYMS = new Map(
  PREMIER_LEAGUE_TEAMS.flatMap((team) =>
    [team.name, ...(team.aliases ?? [])].map((label) => [normalize(label), team])
  )
);

export const normaliseTeamName = (value: string | undefined) => normalize(value ?? '');
