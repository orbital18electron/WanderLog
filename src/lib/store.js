// WanderLog Data Store – localStorage persistence

const K = {
  USERS:    'wl_users',
  POSTS:    'wl_posts',
  COMMENTS: 'wl_comments',
  AUTH:     'wl_auth',
  VOTES:    'wl_votes',
};

const get  = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid  = () => Math.random().toString(36).slice(2,9) + Date.now().toString(36);

// ─── Seed ──────────────────────────────────────────────────────────

const SEED_USERS = [
  { id:'u1', username:'elena_wanders', name:'Elena Marchetti',  bio:'Solo traveller. 47 countries and counting.', avatar:'🌿', joined:'2023-01-15' },
  { id:'u2', username:'kai_roams',     name:'Kai Nakamura',     bio:'Photographer & adventure seeker. Kyoto-based.', avatar:'📷', joined:'2023-03-20' },
  { id:'u3', username:'priya_travels', name:'Priya Sharma',     bio:'Budget backpacker. Street food obsessed.', avatar:'🎒', joined:'2023-06-10' },
];

const SEED_POSTS = [
  {
    id:'p1', authorId:'u1',
    title:'Three Weeks in Japan: Cherry Blossoms, Mountain Temples, and the Silence of Kyoto at Dawn',
    excerpt:'Japan in spring is something I had imagined for years. Nothing prepared me for the particular quality of stillness that exists in Kyoto before the tourists arrive — petals on dark canal water, a grey heron holding perfectly still.',
    cover:'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1400&q=85',
    route:'east-asia', journeyType:'solo', duration:21, startDate:'2024-03-25',
    tags:['Japan','spring','solo','culture','hiking','onsen'],
    upvotes:284, createdAt:'2024-04-20T10:30:00Z',
    days:[
      { day:1, location:'Tokyo, Japan', lat:35.6762, lng:139.6503, title:'Arrival & Sensoji at Dawn',
        content:`Landed at Narita at 6am after the overnight flight from Rome. The subway immediately humbled me — not because it's confusing, but because of the quiet. No one is on the phone. No one is talking loudly. A thousand people reading, or looking out the window, or asleep.\n\nGot to my guesthouse in Asakusa by 9am. Left my bags and walked straight to Sensoji. At that hour, the lantern-gate frames nothing but pale mist. I stood there for twenty minutes feeling something I hadn't felt in months: completely, utterly present.` },
      { day:3, location:'Hakone, Japan', lat:35.2323, lng:139.1069, title:'Fuji from the Ryokan Window',
        content:`Took the Romancecar from Shinjuku. Stayed at a small ryokan — tatami mats, futon on the floor, a private onsen looking out at cedar trees. At 5:30am Fuji was perfectly clear, perfectly pink.\n\nI cried a little, which surprised me. I think it was the cumulative weight of beauty. Three days in and my nervous system was still recalibrating to a place where everything — the light, the food, the architecture — seemed designed with deliberate care.` },
      { day:8, location:'Kyoto, Japan', lat:35.0116, lng:135.7681, title:"The Philosopher's Path, Empty",
        content:`Arrived Kyoto by shinkansen. The cherry blossoms at absolute peak. The Philosopher's Path should be crowded — I woke at 5am and had it nearly to myself for forty minutes.\n\nPetals on the water. Petals in my hair. A grey heron standing absolutely still in the canal, indifferent to everything. This is the image I will carry from Japan.` },
      { day:14, location:'Osaka, Japan', lat:34.6937, lng:135.5023, title:'Dotonbori and the Art of Eating Standing Up',
        content:`After Kyoto's refinement, Osaka hits like a different country entirely. Neon, noise, takoyaki stands open until 3am. I ate nine things in four hours and have no regrets.\n\nDotonbori at night is genuinely beautiful in its chaos. The Glico running man reflected in the canal. A jazz trio playing to no one outside a shuttered department store.` },
    ],
    mapCenter:[35.6762,139.6503], mapZoom:7,
  },
  {
    id:'p2', authorId:'u2',
    title:'Patagonia by 4WD: 2,400km of Gravel Roads, Condors, and Impossible Light',
    excerpt:`Rented a truck in Puerto Montt and drove south. The Carretera Austral is the most beautiful road I have ever driven — three weeks of river crossings, estancias at dusk, and the particular loneliness of being very far from anything.`,
    cover:'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1400&q=85',
    route:'south-america', journeyType:'road-trip', duration:21, startDate:'2024-01-10',
    tags:['Patagonia','Chile','road-trip','photography','nature','hiking'],
    upvotes:197, createdAt:'2024-01-30T14:00:00Z',
    days:[
      { day:1, location:'Puerto Montt, Chile', lat:-41.4717, lng:-72.9333, title:'The Truck',
        content:`The rental guy looked at my booking, then at my city shoes, and asked if I'd driven on gravel before. I lied convincingly. He handed me the keys to a 2019 Hilux and said not to trust river crossings deeper than the side mirrors.\n\nDrove south for three hours before stopping at a roadside stall for a completo — a Chilean hot dog buried under avocado, tomato, and mayonnaise, the engineering of which defies explanation.` },
      { day:7, location:'Cochrane, Chile', lat:-47.2503, lng:-72.5786, title:'Eight Hours Without Signal',
        content:`Today: three hours of empty valley, condors riding thermals, one estancia where a gaucho waved. No phone signal for eight hours. I ate an empanada from the town store and watched the river until the light failed.\n\nThere is something that happens to the mind when it's genuinely unreachable. A particular quiet that I suspect is its natural state.` },
      { day:15, location:'Torres del Paine, Chile', lat:-51.1338, lng:-72.9634, title:'The Towers at Sunrise',
        content:`Woke at 4am for the sunrise hike. Two hours of boulder field in the dark with a headtorch, following cairns, occasionally losing the path entirely.\n\nThen: the most dramatic stone needles I have seen anywhere, turning orange, then gold, then blinding white. Wind so strong I had to brace against it to keep the camera steady. Worth every frozen extremity.` },
    ],
    mapCenter:[-46.0,-72.5], mapZoom:6,
  },
  {
    id:'p3', authorId:'u3',
    title:'Six Weeks in Southeast Asia on $28 a Day: Every Hostel, Bus, and Bowl of Khao Soi',
    excerpt:`Thailand → Vietnam → Cambodia → Laos. Six weeks, $1,176 total including flights from Delhi. Here is every number, every transport hack, and every meal that made the whole thing worthwhile.`,
    cover:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400&q=85',
    route:'southeast-asia', journeyType:'backpacking', duration:42, startDate:'2023-11-01',
    tags:['Southeast Asia','budget','backpacking','food','temples','Thailand','Vietnam'],
    upvotes:341, createdAt:'2023-12-20T09:00:00Z',
    days:[
      { day:1, location:'Bangkok, Thailand', lat:13.7563, lng:100.5018, title:'Khao San Road Is Everything They Say',
        content:`And I mean that in both directions. Yes it's chaotic and yes it's touristy. Yes, the pad thai from the cart on the corner at 11pm cost 60 baht and was transcendent.\n\nMy dorm bed: $8.70. Starting the budget tracker. Day one rule: eat everything that smells good from the street.` },
      { day:15, location:'Hội An, Vietnam', lat:15.8794, lng:108.3350, title:'Hoi An: The Town That Ruins You for Other Towns',
        content:`Every person who told me this was their favourite place was right. Ancient Town at 7am before the tourists wake, lanterns still lit, women setting up bánh mì stalls, tailors opening shutters.\n\nGot a dress made for $22. Ate cao lầu three times in one day. At some point I stopped photographing things and just sat and watched.` },
      { day:28, location:'Siem Reap, Cambodia', lat:13.3633, lng:103.8564, title:'Angkor at 5am',
        content:`Hired a tuk-tuk driver named Virak who picked me up at 4:45am in total darkness. We drove through mist to Angkor Wat and waited.\n\nThe sunrise over the reflecting pools is every photo you've seen and also completely unlike any of them. Nothing prepares you for the scale. I stayed for four hours and felt I'd barely seen anything.` },
    ],
    mapCenter:[13.0,103.0], mapZoom:5,
  },
];

const SEED_COMMENTS = [
  { id:'c1', postId:'p1', authorId:'u2', content:"The Philosopher's Path at 5am is right. I did the same last spring — by 8am it was wall-to-wall tourists. Worth every minute of the early alarm.", upvotes:24, createdAt:'2024-04-21T08:00:00Z', parentId:null },
  { id:'c2', postId:'p1', authorId:'u3', content:"How did you find the Kumano Kodo solo? I've wanted to do it but heard navigation is tricky without Japanese.", upvotes:11, createdAt:'2024-04-21T11:30:00Z', parentId:null },
  { id:'c3', postId:'p1', authorId:'u1', content:"Replying to Priya — the Tanabe City Tourism Bureau maps are genuinely excellent, all in English. Downloaded the trail app too. Only properly lost once.", upvotes:8, createdAt:'2024-04-22T09:00:00Z', parentId:'c2' },
  { id:'c4', postId:'p2', authorId:'u1', content:"The Carretera Austral has been on my list for three years. Your photos are the final push. Booking now.", upvotes:17, createdAt:'2024-02-01T10:00:00Z', parentId:null },
  { id:'c5', postId:'p3', authorId:'u1', content:"The Hoi An section is perfect. Did you make it to My Son? 45 minutes out, far fewer tourists than Angkor.", upvotes:9, createdAt:'2023-12-21T07:00:00Z', parentId:null },
];

// ─── Init ──────────────────────────────────────────────────────────

export function initStore() {
  if (typeof window === 'undefined') return;
  if (!get(K.USERS))    save(K.USERS,    SEED_USERS);
  if (!get(K.POSTS))    save(K.POSTS,    SEED_POSTS);
  if (!get(K.COMMENTS)) save(K.COMMENTS, SEED_COMMENTS);
  if (!get(K.VOTES))    save(K.VOTES,    {});
}

// ─── Auth ──────────────────────────────────────────────────────────

export const getCurrentUser = () => get(K.AUTH);

export function login(username) {
  const user = (get(K.USERS)||[]).find(u => u.username === username);
  if (!user) return { error: 'User not found' };
  save(K.AUTH, user);
  return { user };
}

export function register(username, name) {
  const users = get(K.USERS) || [];
  if (users.find(u => u.username === username)) return { error: 'Username already taken' };
  const AVATARS = ['🌍','🧭','✈️','🏔️','🌊','🗺️','⛺','🌺','🌿','📷','🎒','🏄'];
  const user = { id: uid(), username, name, bio:'', avatar: AVATARS[Math.floor(Math.random()*AVATARS.length)], joined: new Date().toISOString().split('T')[0] };
  save(K.USERS, [...users, user]);
  save(K.AUTH, user);
  return { user };
}

export function logout() { localStorage.removeItem(K.AUTH); }

export function updateProfile(updates) {
  const user = get(K.AUTH);
  if (!user) return null;
  const updated = { ...user, ...updates };
  save(K.USERS, (get(K.USERS)||[]).map(u => u.id === user.id ? updated : u));
  save(K.AUTH, updated);
  return updated;
}

// ─── Users ─────────────────────────────────────────────────────────

export const getUser    = (id)       => (get(K.USERS)||[]).find(u => u.id === id);
export const getByUsername = (uname) => (get(K.USERS)||[]).find(u => u.username === uname);

// ─── Posts ─────────────────────────────────────────────────────────

export const getPosts    = ()   => get(K.POSTS) || [];
export const getPost     = (id) => (get(K.POSTS)||[]).find(p => p.id === id);

export function createPost(data) {
  const post = { ...data, id: uid(), upvotes: 0, createdAt: new Date().toISOString() };
  save(K.POSTS, [post, ...(get(K.POSTS)||[])]);
  return post;
}

export function updatePost(id, data) {
  const posts = (get(K.POSTS)||[]).map(p => p.id === id ? { ...p, ...data } : p);
  save(K.POSTS, posts);
  return posts.find(p => p.id === id);
}

export function deletePost(id) {
  save(K.POSTS, (get(K.POSTS)||[]).filter(p => p.id !== id));
}

// ─── Votes ─────────────────────────────────────────────────────────

export function togglePostVote(postId, userId) {
  const votes = get(K.VOTES) || {};
  const key   = `p_${postId}_${userId}`;
  const post  = getPost(postId);
  if (!post) return null;
  const did = !!votes[key];
  did ? delete votes[key] : (votes[key] = 1);
  save(K.VOTES, votes);
  const updated = { ...post, upvotes: Math.max(0, post.upvotes + (did ? -1 : 1)) };
  save(K.POSTS, (get(K.POSTS)||[]).map(p => p.id === postId ? updated : p));
  return { voted: !did, upvotes: updated.upvotes };
}

export const hasVotedPost    = (postId,    userId) => !!(get(K.VOTES)||{})[`p_${postId}_${userId}`];

export function toggleCommentVote(commentId, userId) {
  const votes   = get(K.VOTES) || {};
  const key     = `c_${commentId}_${userId}`;
  const comments = get(K.COMMENTS) || [];
  const comment  = comments.find(c => c.id === commentId);
  if (!comment) return null;
  const did = !!votes[key];
  did ? delete votes[key] : (votes[key] = 1);
  save(K.VOTES, votes);
  const updated = { ...comment, upvotes: Math.max(0, comment.upvotes + (did ? -1 : 1)) };
  save(K.COMMENTS, comments.map(c => c.id === commentId ? updated : c));
  return { voted: !did, upvotes: updated.upvotes };
}

export const hasVotedComment = (commentId, userId) => !!(get(K.VOTES)||{})[`c_${commentId}_${userId}`];

// ─── Comments ──────────────────────────────────────────────────────

export const getPostComments = (postId) => (get(K.COMMENTS)||[]).filter(c => c.postId === postId);

export function addComment(postId, authorId, content, parentId = null) {
  const c = { id: uid(), postId, authorId, content, parentId, upvotes: 0, createdAt: new Date().toISOString() };
  save(K.COMMENTS, [...(get(K.COMMENTS)||[]), c]);
  return c;
}

// ─── Static Data ───────────────────────────────────────────────────

export const ROUTES = [
  { id:'east-asia',      name:'East Asia',       emoji:'🏯', desc:'Japan, Korea, China, Taiwan',             members:12400 },
  { id:'southeast-asia', name:'Southeast Asia',  emoji:'🌴', desc:'Thailand, Vietnam, Bali, Cambodia',       members:18600 },
  { id:'south-america',  name:'South America',   emoji:'🏔️', desc:'Patagonia, Amazon, Andes, Pacific Coast', members:9200  },
  { id:'europe',         name:'Europe',          emoji:'🏰', desc:'Rail passes, cobblestones, and wine',     members:21000 },
  { id:'africa',         name:'Africa',          emoji:'🦁', desc:'Sahara, savanna, coasts, cities',         members:6800  },
  { id:'middle-east',    name:'Middle East',     emoji:'🕌', desc:'Levant, Gulf, ancient wonders',           members:4300  },
  { id:'north-america',  name:'North America',   emoji:'🌲', desc:'National parks, cities, road trips',      members:15700 },
  { id:'oceania',        name:'Oceania',         emoji:'🌊', desc:'Australia, New Zealand, Pacific islands', members:7100  },
];

export const JOURNEY_TYPES = [
  { id:'solo',        label:'Solo',       emoji:'🧍' },
  { id:'backpacking', label:'Backpacking',emoji:'🎒' },
  { id:'road-trip',   label:'Road Trip',  emoji:'🚗' },
  { id:'family',      label:'Family',     emoji:'👨‍👩‍👧' },
  { id:'couple',      label:'Couple',     emoji:'💑' },
  { id:'group',       label:'Group',      emoji:'👥' },
  { id:'luxury',      label:'Luxury',     emoji:'✦'  },
  { id:'adventure',   label:'Adventure',  emoji:'🧗' },
];
