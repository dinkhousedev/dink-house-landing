/**
 * 26-week engagement newsletter calendar for the waitlist.
 * One send per week on a 3-week rotation: Tips → Health → Pickleball culture.
 * Engagement only — no fundraising, membership sales, or donation CTAs.
 *
 * Every week renders through the same branded shell (renderDinkHouseEmail),
 * so editing a week means editing its calendar entry here, nothing else.
 */

import {
  BRAND,
  displayStack,
  emailHero,
  emailPanel,
  emailPhoto,
  escapeHtml,
  fontStack,
  renderDinkHouseEmail,
} from "./email-templates.js";

export type WeeklyTheme = "tips" | "health" | "culture";

export const THEME_LABELS: Record<WeeklyTheme, string> = {
  tips: "Tips",
  health: "Health",
  culture: "All Things Pickleball",
};

/**
 * Public Wikimedia Commons photos (not Dink House facility renders).
 * Files live in public/email/weekly/; email clients need HTTPS URLs.
 */
const SITE = "https://thedinkhousepb.com";
const WEEKLY_DIR = `${SITE}/email/weekly`;

const pub = (file: string) => `${WEEKLY_DIR}/${file}`;

export const WEEKLY_IMAGES = {
  siteBase: WEEKLY_DIR,
} as const;

export interface WeeklyEmailEntry {
  week: number;
  theme: WeeklyTheme;
  subject: string;
  preheader: string;
  heading: string;
  heroSrc: string;
  heroAlt: string;
  photoSrc?: string;
  photoAlt?: string;
  photoCaption?: string;
  /** Plain-text paragraphs (escaped at render time). */
  intro: string[];
  /** Panel title, e.g. "Try this week" / "Pass it on". */
  tryThisTitle: string;
  tryThis: string;
}

export const weeklyCalendar: WeeklyEmailEntry[] = [
  {
    week: 1,
    theme: "tips",
    subject: "Week 1: Own the kitchen line",
    preheader: "The non-volley zone decides more rallies than any smash.",
    heading: "Own the kitchen",
    heroSrc: pub("lacrosse-court.jpg"),
    heroAlt: "A full complex of outdoor pickleball courts",
    photoSrc: pub("sports-glasses.jpg"),
    photoAlt: "Sports glasses for court play",
    intro: [
      "Welcome to week one of The Dink House weekly — one short read every week: a tip, a health note, or a slice of pickleball culture. This week: the kitchen.",
      "The kitchen is the 7-foot non-volley zone on each side of the net. You can't hit a volley while standing in it, but almost every rally is won or lost at its edge.",
      "Most new players hang back near the baseline. The best players get to the kitchen line and hold it — that's where dinks, resets, and put-aways live.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "After your team's third shot, move up together and put your toes an inch behind the kitchen line. Hold that line for the whole rally. Count how many points you win up there versus hanging back — the line doesn't lie.",
  },
  {
    week: 2,
    theme: "health",
    subject: "Week 2: The 5-minute warm-up that saves your season",
    preheader: "Five minutes before you play beats five weeks of rehab.",
    heading: "Warm up like it matters",
    heroSrc: pub("indoor-arcade.jpg"),
    heroAlt: "Indoor pickleball in a sunlit hall",
    photoSrc: pub("courts-4.jpg"),
    photoAlt: "Outdoor pickleball courts ready for play",
    intro: [
      "Pickleball looks gentle right up until you lunge for a dink cold. Most court injuries — calf pulls, Achilles strains, rolled ankles — happen in the first fifteen minutes of play.",
      "You don't need a routine worthy of a pro. You need blood in the muscles and joints that have moved through their full range before the first sprint.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Before your first game: 2 minutes of brisk walking or light jogging, 10 leg swings per side, 10 arm circles each direction, 10 bodyweight squats, then 2 minutes of easy dinking before anyone keeps score.",
  },
  {
    week: 3,
    theme: "culture",
    subject: "Week 3: Why everyone you know suddenly plays pickleball",
    preheader: "From a backyard in 1965 to America's fastest-growing sport.",
    heading: "The fastest-growing sport in America",
    heroSrc: pub("beach-paddles.jpg"),
    heroAlt: "Paddles and balls on the sand",
    photoSrc: pub("paddle-color.jpg"),
    photoAlt: "A close look at a paddle face",
    intro: [
      "Pickleball was invented in 1965 on Bainbridge Island, Washington, by three dads improvising a game for bored kids with a badminton court, ping-pong paddles, and a plastic ball.",
      "It's now America's fastest-growing sport, with tens of millions of players. The reason is simple: you can learn it in an afternoon, play it at any age, and the court is small enough that every rally is a conversation.",
      "That mix — easy to start, hard to master, impossible to play alone — is exactly why we're building a home for it in Central Texas.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "Know someone who \"doesn't play sports\"? Invite them to hit for 20 minutes this week. Pickleball's superpower is that nobody stays a beginner for long.",
  },
  {
    week: 4,
    theme: "tips",
    subject: "Week 4: The third-shot drop, demystified",
    preheader: "The shot that turns defense into offense.",
    heading: "Master the third-shot drop",
    heroSrc: pub("courts-3.jpg"),
    heroAlt: "Outdoor pickleball courts",
    photoSrc: pub("indoor-hall.jpg"),
    photoAlt: "An indoor court under the lights",
    intro: [
      "Serve, return, and then… the most important shot in pickleball. The serving team starts every rally at a disadvantage — the returners are already camped at the kitchen line.",
      "The third-shot drop is a soft, arcing shot that lands in the opponents' kitchen and dies at their feet. It buys your team time to move up and erases their net advantage.",
      "Think of it as a long dink, not a short drive: soft grip, lift from the shoulder, and let the ball peak on your side of the net.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Stand at the baseline with a bucket of balls and a partner (or a target) at the opposite kitchen. Hit 20 drops aiming to land every ball inside the kitchen. Height is your friend — a drop that floats a little high but lands soft beats a fast one that sits up.",
  },
  {
    week: 5,
    theme: "health",
    subject: "Week 5: Save your shoulders",
    preheader: "Overheads feel great — until they don't. Keep the rotator cuff happy.",
    heading: "Shoulder care for paddle players",
    heroSrc: pub("gold-medal.jpg"),
    heroAlt: "A pickleball champion on the podium",
    photoSrc: pub("team-whole.jpg"),
    photoAlt: "A pickleball club team after a tournament",
    intro: [
      "Pickleball is friendlier to shoulders than tennis, but thousands of overheads and speed-ups still add up — especially for the rotator cuff, the small muscles that keep your arm centered in its socket.",
      "The warning signs are quiet: a pinch on high backhands, an ache after long sessions, stiffness reaching behind your back. Catch it early and it's maintenance, not injury.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Twice this week: band external rotations (2×15 each arm, elbow pinned to your side) and band pull-aparts (2×15). Ninety seconds total, and your future self clears every lob.",
  },
  {
    week: 6,
    theme: "culture",
    subject: "Week 6: The unwritten rules of open play",
    preheader: "Paddle stacking, \"ball on!\", and other things nobody tells beginners.",
    heading: "Court etiquette 101",
    heroSrc: pub("outdoor-courts.jpg"),
    heroAlt: "Two outdoor pickleball courts from above",
    photoSrc: pub("paddle-2025.jpg"),
    photoAlt: "A paddle and balls on the kitchen line",
    intro: [
      "Every pickleball community runs on a handful of unwritten rules, and learning them is faster than learning the third-shot drop.",
      "The big ones: stack your paddle in the rack to claim the next game, call \"ball on!\" loudly when a stray ball rolls onto a live court (and stop play immediately — it's a safety thing), give the benefit of the doubt on line calls you can't see, and tap paddles at the net win or lose.",
      "Etiquette is really just the sport's way of keeping strangers friendly — which is the whole point of open play.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "Playing with someone new this week? Walk them through the paddle-stacking system before they have to guess. Instant regular.",
  },
  {
    week: 7,
    theme: "tips",
    subject: "Week 7: Win the dink battle",
    preheader: "Slow is smooth, and smooth wins rallies.",
    heading: "The art of the dink",
    heroSrc: pub("paddle-one.jpg"),
    heroAlt: "A pickleball paddle and balls on the court",
    photoSrc: pub("courts-1.jpg"),
    photoAlt: "A pickleball court with the kitchen in view",
    intro: [
      "A dink is a soft shot from your kitchen line into theirs, too low to attack. To new players it looks like stalling. It's actually a knife fight in slow motion.",
      "The goal isn't to end the point — it's to make your opponent hit up on the ball until they float one high. Patience is a weapon: the player who attacks a ball they shouldn't loses the rally.",
      "Keep your paddle in front of you, make contact out ahead of your body, and aim cross-court — it gives you more kitchen to land in and a lower net to clear.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Play \"dink singles\" on half a court: kitchen-to-kitchen only, first to 11, anything that bounces past the kitchen line loses the point. Ten minutes of this sharpens your soft game faster than a month of open play.",
  },
  {
    week: 8,
    theme: "health",
    subject: "Week 8: Beating the Texas heat",
    preheader: "Central Texas summers don't negotiate. Here's your game plan.",
    heading: "Hydrate like a Texan",
    heroSrc: pub("demo-court.jpg"),
    heroAlt: "Players on an indoor pickleball court",
    photoSrc: pub("court-rules.jpg"),
    photoAlt: "Posted pickleball court rules",
    photoCaption: "Indoor, climate-controlled courts are coming to Bell County.",
    intro: [
      "Central Texas heat is not a joke — on a 100° afternoon, an outdoor court can play 10–15 degrees hotter than the air, and you can sweat out more than a liter an hour.",
      "Thirst lags behind need. By the time you feel dry, your reaction time and judgment are already dipping — which is exactly when rolled ankles and bad decisions happen.",
      "(Yes, this is one more argument for indoor, climate-controlled courts. We're working on it.)",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Drink 16 oz of water in the hour before you play, then 4–6 oz every changeover. Playing more than an hour in the heat? Alternate water with an electrolyte drink, and take real shade breaks — dizziness, chills, or goosebumps in the heat mean stop, now.",
  },
  {
    week: 9,
    theme: "culture",
    subject: "Week 9: What's your DUPR?",
    preheader: "What a 3.5 actually means — and why you shouldn't obsess over it.",
    heading: "Ratings, explained",
    heroSrc: pub("team-win.jpg"),
    heroAlt: "A winning pickleball team after a match",
    photoSrc: pub("balls-paddles.jpg"),
    photoAlt: "Paddles and balls ready for a session",
    intro: [
      "Hang around pickleball long enough and you'll hear numbers: \"She's a 4.0,\" \"that's a 3.5 game.\" Player ratings run roughly from 2.0 (brand new) to 5.0+ (tournament sharp).",
      "DUPR is the rating system most players use now — it updates from real match scores, rec games included, so it tracks how you actually play rather than how you self-assess.",
      "Ratings are great for finding balanced games and terrible as a self-worth metric. Use the number to find your people, then forget it.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Curious? Download the DUPR app, log a few rec games with friends, and watch your number settle in. It takes about 5–10 matches to mean anything.",
  },
  {
    week: 10,
    theme: "tips",
    subject: "Week 10: A serve they can't attack",
    preheader: "You only control one shot completely. Make it count.",
    heading: "Serve deep, serve smart",
    heroSrc: pub("courts-entrance.jpg"),
    heroAlt: "The entrance to a pickleball facility",
    photoSrc: pub("courts-2.jpg"),
    photoAlt: "Outdoor pickleball courts",
    intro: [
      "The serve is the only shot in pickleball you control completely — nobody is rushing you. Yet it's the shot most players practice least.",
      "Depth beats power. A deep serve pins the returner behind the baseline, buys your team time, and makes their return-and-approach harder. A fast serve that lands mid-court does the opposite.",
      "Pick one simple motion and one target: the back third of the box. Consistency first, spice later.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Grab 20 balls and serve at an empty court. Score it: 2 points for the back third, 1 point for in, 0 for out. Beat your score next session. Once you're hitting 30+, start aiming at backhands.",
  },
  {
    week: 11,
    theme: "health",
    subject: "Week 11: Happy knees, longer rallies",
    preheader: "Lunges, stops, and low pickups — your knees do the dirty work.",
    heading: "Knee-proof your game",
    heroSrc: pub("paddles-three.jpg"),
    heroAlt: "A row of pickleball paddles",
    photoSrc: pub("paddle-tech.png"),
    photoAlt: "Carbon-fiber pickleball paddle construction",
    intro: [
      "Every dink you dig out and every drive you chase down ends at your knees. Quick stops and lunges load them with several times your body weight.",
      "Here's the thing: the knee is usually the victim, not the culprit. Weak hips and stiff ankles send their stress to the joint in the middle. Strengthen around the knee and the complaints usually quiet down.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Three times this week: 2×10 sit-to-stands (slow on the way down), 2×10 step-ups per leg on a stair, and 2×30-second wall sits. On court, split-step before your opponent hits — landing balanced is half of knee safety.",
  },
  {
    week: 12,
    theme: "culture",
    subject: "Week 12: Why \"The Dink House\"?",
    preheader: "The shot that gave us our name.",
    heading: "In defense of the dink",
    heroSrc: pub("aerial-courts.jpg"),
    heroAlt: "Aerial view of pickleball courts",
    photoSrc: pub("running-shoes.jpg"),
    photoAlt: "Court shoes ready for play",
    intro: [
      "People ask about the name. The dink is pickleball's signature shot — the soft, patient exchange at the kitchen line that no other racket sport really has.",
      "It's also the shot that says the most about the sport: rallies where power sits down and touch, nerve, and patience take over. Anyone can bang. Dinkers make friends and win championships.",
      "So when we picked a name for a place where pickleball lives, the answer was already on the court. The Dink House: where the dink is home.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "This week, count your longest dink rally. Then try to break the record. Bring a friend — records fall faster with witnesses.",
  },
  {
    week: 13,
    theme: "tips",
    subject: "Week 13: Stacking, finally explained",
    preheader: "Why good doubles teams keep switching sides.",
    heading: "Stacking made simple",
    heroSrc: pub("pros.jpg"),
    heroAlt: "Two players exchanging shots across the net",
    photoSrc: pub("paddle-stack.jpg"),
    photoAlt: "A paddle rack waiting for the next game",
    intro: [
      "Ever watch a doubles team shuffle into strange positions before the serve? That's stacking — arranging yourselves so each player ends up on their preferred side after the shot, no matter what the score says.",
      "The classic reason: keep both forehands in the middle. A righty on the left and a lefty on the right cover the center like a wall — and teams also stack to protect a weaker backhand.",
      "The only rule to remember: you must be positioned legally at the serve, but the moment the ball is struck you can move anywhere. Start by stacking on your own serve — it's the easiest place to learn.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Next rec game, try a half stack: when your stronger-forehand partner serves from the right, line up together and slide into your preferred sides after contact. Two games of that and it stops feeling weird.",
  },
  {
    week: 14,
    theme: "health",
    subject: "Week 14: Rest is a training day",
    preheader: "The gains happen between sessions, not during them.",
    heading: "Recover like you mean it",
    heroSrc: pub("sports-glasses.jpg"),
    heroAlt: "Sports glasses for court play",
    photoSrc: pub("lacrosse-court.jpg"),
    photoAlt: "A full complex of outdoor pickleball courts",
    intro: [
      "Pickleball is sneaky volume. \"Just three games\" becomes three hours, four days a week — and soreness that never quite clears is your body asking for a recovery plan.",
      "Recovery isn't doing nothing. Easy walking, light stretching, and one genuinely off day per week clear more fatigue than collapsing on the couch.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "After your next session: 5 minutes of easy walking before you get in the car, then 30 seconds each of calf, quad, hip flexor, and chest stretches. Protein within an hour, and protect one true rest day this week. Play tired, get hurt — it's that direct.",
  },
  {
    week: 15,
    theme: "culture",
    subject: "Week 15: Indoor vs. outdoor — almost a different sport",
    preheader: "Different balls, different bounce, different game plan.",
    heading: "Indoor vs. outdoor pickleball",
    heroSrc: pub("courts-4.jpg"),
    heroAlt: "Outdoor pickleball courts ready for play",
    photoSrc: pub("indoor-arcade.jpg"),
    photoAlt: "Indoor pickleball in a sunlit hall",
    intro: [
      "Indoor and outdoor pickleball are cousins, not twins. Outdoor balls are heavier with smaller holes to fight the wind; indoor balls are lighter, softer, and rally longer.",
      "Indoors, there's no wind and no sun in your eyes, so touch shots behave — the soft game gets even more valuable. Outdoors, wind punishes high dinks and rewards drives.",
      "Texas adds its own variable: 100° summers and rained-out spring evenings. Climate-controlled courts mean the game you practiced is the game you play, every time.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "Play both this month if you can. Notice which parts of your game travel and which don't — it's the fastest scouting report on your own strengths.",
  },
  {
    week: 16,
    theme: "tips",
    subject: "Week 16: The reset — pickleball's escape hatch",
    preheader: "When you're under attack, don't hit harder. Hit softer.",
    heading: "Learn the reset",
    heroSrc: pub("paddle-color.jpg"),
    heroAlt: "A close look at a paddle face",
    photoSrc: pub("beach-paddles.jpg"),
    photoAlt: "Paddles and balls on the sand",
    intro: [
      "You're caught at mid-court, the ball is speeding at your feet, and every instinct says swing hard. That instinct loses the point.",
      "The reset is a soft block that drops the ball into the kitchen, kills the pace, and lets you get back to the line. It turns \"losing the firefight\" into \"starting the rally over.\"",
      "The secret is doing less: loose grip (a 2 out of 10), paddle out front, no backswing, and let the ball's own pace do the work.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Have a partner stand at the kitchen and hit medium-pace balls at you in the transition zone. Your only job: soft-block everything into the kitchen. 20 balls, count your makes, repeat. Boring drill, game-changing skill.",
  },
  {
    week: 17,
    theme: "health",
    subject: "Week 17: Your back and the bend",
    preheader: "Low balls don't have to wreck your lower back.",
    heading: "Back-friendly pickleball",
    heroSrc: pub("indoor-hall.jpg"),
    heroAlt: "An indoor court under the lights",
    photoSrc: pub("courts-3.jpg"),
    photoAlt: "Outdoor pickleball courts",
    intro: [
      "Pickleball lives low — dinks at your shoelaces, pickups at the net. If you bend from the waist all afternoon, your lower back is doing squats it never signed up for.",
      "The fix is in the legs: bend your knees and drop your hips to get low, keep your chest up, and take the ball out in front of you instead of reaching beside or behind you.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Off court, twice this week: 2×10 glute bridges, 2×10 bird-dogs per side, and a 30-second plank. On court, one cue — \"knees, not waist\" — every time you set up to dink. Your back will report the difference within two weeks.",
  },
  {
    week: 18,
    theme: "culture",
    subject: "Week 18: Pickleball is having a moment in Central Texas",
    preheader: "Courts are filling up from Austin to Waco — and Bell County is next.",
    heading: "The Central Texas scene",
    heroSrc: pub("team-whole.jpg"),
    heroAlt: "A pickleball club team after a tournament",
    photoSrc: pub("gold-medal.jpg"),
    photoAlt: "A pickleball champion on the podium",
    intro: [
      "Look around Central Texas: rec-center courts with waitlists, tennis courts wearing fresh pickleball lines, leagues filling the day signups open. The boom isn't coming — it's here.",
      "What Bell County doesn't have yet is a true home for it: dedicated indoor courts where the schedule doesn't depend on the weather and the community has a place to gather.",
      "That's the gap we're building The Dink House to fill — and being on this list means you'll watch it happen first.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "Tell us where you play now — just hit reply. Seriously: knowing where the local scene lives (and what it's missing) shapes what we build.",
  },
  {
    week: 19,
    theme: "tips",
    subject: "Week 19: Talk to your partner",
    preheader: "\"Mine, yours, bounce, switch\" — four words that win games.",
    heading: "Doubles is a conversation",
    heroSrc: pub("paddle-2025.jpg"),
    heroAlt: "A paddle and balls on the kitchen line",
    photoSrc: pub("outdoor-courts.jpg"),
    photoAlt: "Two outdoor pickleball courts from above",
    intro: [
      "That middle ball you both watched land? It wasn't a skill problem. Most doubles points are lost in the silence between partners.",
      "Good teams are loud: \"mine\" and \"yours\" on anything near the middle, \"bounce\" on balls sailing deep, \"switch\" when someone gets pulled wide. Call it early, not as the ball arrives.",
      "And after the rally, one habit separates fun partners from stressful ones: paddle tap, short memory, next point.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Play one session where someone calls \"mine\" or \"yours\" on every single ball, even the obvious ones. It feels silly for ten minutes — then the middle stops being no-man's-land for good.",
  },
  {
    week: 20,
    theme: "health",
    subject: "Week 20: The cheapest insurance in pickleball",
    preheader: "A speed-up at the net travels faster than you can blink.",
    heading: "Protect your eyes",
    heroSrc: pub("courts-1.jpg"),
    heroAlt: "A pickleball court with the kitchen in view",
    photoSrc: pub("paddle-one.jpg"),
    photoAlt: "A pickleball paddle and balls on the court",
    intro: [
      "Nobody thinks about eye protection until the day they do. A speed-up at the kitchen line can reach 40+ mph from ten feet away — faster than your blink reflex.",
      "Eye injuries are among the most common serious pickleball injuries, and nearly all of them are preventable with a $15–30 pair of polycarbonate court glasses. Clear lenses indoors, tinted outdoors, and prescription options exist.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Order a pair this week and wear them for three sessions straight. That's how long it takes to forget they're on your face — and after the first ball pings off them, you'll never play without.",
  },
  {
    week: 21,
    theme: "culture",
    subject: "Week 21: Pickleball is a spectator sport now",
    preheader: "Yes, it's on TV. Yes, watching will make you better.",
    heading: "How to watch pro pickleball",
    heroSrc: pub("court-rules.jpg"),
    heroAlt: "Posted pickleball court rules",
    photoSrc: pub("demo-court.jpg"),
    photoAlt: "Players on an indoor pickleball court",
    intro: [
      "Pro pickleball is genuinely watchable now — the pro tours stream matches every month, and the majors show up on mainstream sports channels.",
      "Watch for ten minutes and you'll notice: the pros aren't overpowering each other, they're out-patient-ing each other. Long dink exchanges, sudden speed-ups, resets that look impossible.",
      "It's also the best free coaching there is. Watch what the receiving team does right after the return — that's the blueprint for your own doubles positioning.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Queue up one pro doubles match and watch just one player the whole time — where they stand, when they attack, when they reset. Steal one habit and take it to open play.",
  },
  {
    week: 22,
    theme: "tips",
    subject: "Week 22: Footwork first, paddle second",
    preheader: "The split step is the most important shot you'll never hit.",
    heading: "Move like a player",
    heroSrc: pub("balls-paddles.jpg"),
    heroAlt: "Paddles and balls ready for a session",
    photoSrc: pub("team-win.jpg"),
    photoAlt: "A winning pickleball team after a match",
    intro: [
      "Watch a strong player and the paddle looks calm — because their feet did the work early. Most \"bad shots\" are really late feet asking the arm to bail them out.",
      "Two habits carry the load: the split step (a small hop onto the balls of your feet the instant your opponent hits), and moving through the transition zone in stages — advance behind your shots, pause balanced, advance again.",
      "Balanced beats fast. Arriving early with your weight set is worth more than arriving quickly off-balance.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "For one session, split-step on literally every opponent contact — serve, dink, everything. Your legs will be tired and your hands will feel psychic. That's not a coincidence.",
  },
  {
    week: 23,
    theme: "health",
    subject: "Week 23: Playing your best pickleball after 40",
    preheader: "This sport is perfect for every age — if you do the maintenance.",
    heading: "Strong after 40",
    heroSrc: pub("courts-2.jpg"),
    heroAlt: "Outdoor pickleball courts",
    photoSrc: pub("courts-entrance.jpg"),
    photoAlt: "The entrance to a pickleball facility",
    intro: [
      "One of pickleball's superpowers is that 40-, 60-, and 75-year-olds genuinely compete on the same court. But past 40, the margin for skipping maintenance shrinks: tendons recover slower, and muscle you don't use, you lose.",
      "The playbook is short: strength work twice a week (legs, hips, core), a real warm-up every session (see week 2), and respect for the 24 hours after a long play day.",
      "The players still competing at 75 aren't the ones who were best at 45 — they're the ones who kept the habit.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Pick two 20-minute slots this week: squats or sit-to-stands, a hinge (bridges or deadlifts), a push, a pull, and a carry. Nothing fancy, just consistent. Strength is the closest thing aging athletes have to a cheat code.",
  },
  {
    week: 24,
    theme: "culture",
    subject: "Week 24: Paddles have gotten weird (in a good way)",
    preheader: "From plywood to carbon fiber — and what actually matters when you buy.",
    heading: "A quick tour of paddle tech",
    heroSrc: pub("paddle-tech.png"),
    heroAlt: "Carbon-fiber pickleball paddle construction",
    photoSrc: pub("paddles-three.jpg"),
    photoAlt: "A row of pickleball paddles",
    intro: [
      "The first pickleball paddles were plywood. Today's are aerospace-grade: carbon-fiber faces, foam-injected edges, thermoformed cores — with prices to match.",
      "Here's the secret the marketing won't tell you: below a 4.0 level, the paddle is rarely the bottleneck. What actually matters is weight (7.8–8.2 oz is a safe middle), grip size (too big invites elbow trouble), and shape (longer = reach, wider = forgiveness).",
      "A $90 paddle from a reputable brand plays 95% as well as the $250 flagship. Spend the difference on a lesson — or a bucket of balls and a wall.",
    ],
    tryThisTitle: "Pass it on",
    tryThis:
      "Before you upgrade, borrow. Swap paddles with three different people at open play for a game each. You'll learn more in an hour than in a week of review videos.",
  },
  {
    week: 25,
    theme: "tips",
    subject: "Week 25: Get a grip (the right one)",
    preheader: "The fix for pop-ups is in your hand.",
    heading: "Grip: pressure and position",
    heroSrc: pub("running-shoes.jpg"),
    heroAlt: "Court shoes ready for play",
    photoSrc: pub("aerial-courts.jpg"),
    photoAlt: "Aerial view of pickleball courts",
    intro: [
      "If your dinks pop up and your resets fly long, look at your hand before you blame your swing. Grip is the most-ignored fundamental in pickleball.",
      "Position: the continental grip — shake hands with the paddle — works for dinks, volleys, and serves without switching. Pressure: on a 1–10 scale, soft shots want a 2–3, drives maybe a 5–6. Most players squeeze at 8 all day.",
      "A death grip turns your paddle into a trampoline: every ball springs off high and attackable. Soft hands absorb pace; tight hands feed it right back to your opponent.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Rally while consciously holding the paddle at 2-out-of-10 pressure — so loose it almost turns in your hand. Feel how the ball dies off the face. That feeling is what a real reset is made of.",
  },
  {
    week: 26,
    theme: "health",
    subject: "Week 26: The performance enhancer you're skipping",
    preheader: "Half a year of tips ends with the one that powers all the others.",
    heading: "Sleep: the free upgrade",
    heroSrc: pub("paddle-stack.jpg"),
    heroAlt: "A paddle rack waiting for the next game",
    photoSrc: pub("pros.jpg"),
    photoAlt: "Two players exchanging shots across the net",
    photoCaption: "See you on the courts.",
    intro: [
      "Twenty-six weeks ago we started at the kitchen line. We're ending with the habit that makes every other one work: sleep.",
      "Reaction time, decision-making, tendon repair, your mood at 10–10–2 — all of it is built overnight. Research on athletes shows measurably faster reactions and fewer injuries with consistent 7–9 hour nights.",
      "Thanks for reading along this season. Keep an eye on this space — the next chapter of The Dink House is the one where we open the doors.",
    ],
    tryThisTitle: "Try this week",
    tryThis:
      "Protect your sleep like court time: consistent lights-out, screens down 30 minutes before, no caffeine after 2 pm. Then notice your hands at the kitchen line on day four. See you on the courts.",
  },
];

export function getWeeklyEmail(week: number): WeeklyEmailEntry {
  const entry = weeklyCalendar.find((item) => item.week === week);
  if (!entry) {
    throw new Error(
      `No weekly email defined for week ${week} (valid: 1-${weeklyCalendar.length})`,
    );
  }
  return entry;
}

export interface WeeklyEmailData {
  first_name: string;
  site_url?: string;
  unsubscribe_url?: string;
}

const FOLLOW_URL = "https://www.instagram.com/the.dink.house";

function paragraph(escapedText: string): string {
  return `<p style="margin: 0 0 16px; font-family: ${fontStack()}; font-size: 16px; line-height: 1.6; color: ${BRAND.white};">${escapedText}</p>`;
}

function engagementStrip(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 8px 0 24px; background-color: ${BRAND.lime};">
      <tr>
        <td style="padding: 22px 24px; text-align: center;">
          <p style="margin: 0 0 8px; font-family: ${displayStack()}; font-size: 22px; letter-spacing: 1px; color: ${BRAND.black}; text-transform: uppercase;">
            Tell us how it went
          </p>
          <p style="margin: 0; font-family: ${fontStack()}; font-size: 15px; color: ${BRAND.black};">
            Hit reply — we read every note. And bring a friend to the courts this week.
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function generateWeeklyEmailHTML(
  week: number,
  data: WeeklyEmailData,
): string {
  const entry = getWeeklyEmail(week);
  const siteUrl = (data.site_url || BRAND.defaultSiteUrl).replace(/\/$/, "");
  const unsubscribeUrl = data.unsubscribe_url
    ? escapeHtml(data.unsubscribe_url)
    : `${siteUrl}/unsubscribe`;
  const firstName = escapeHtml(data.first_name);

  const bodyHtml = `
    ${paragraph(`Hi ${firstName},`)}
    ${entry.intro.map((text) => paragraph(escapeHtml(text))).join("\n")}
    ${
      entry.photoSrc
        ? emailPhoto(entry.photoSrc, entry.photoAlt || "", entry.photoCaption)
        : ""
    }
    ${emailPanel(
      `<p style="margin: 0; font-family: ${fontStack()}; font-size: 15px; line-height: 1.6; color: ${BRAND.white};">${escapeHtml(entry.tryThis)}</p>`,
      entry.tryThisTitle,
    )}
    ${engagementStrip()}
    ${paragraph(
      `See you on the courts,<br /><strong style="color: ${BRAND.lime};">The Dink House Team</strong>`,
    )}
    <p style="margin: 28px 0 0; font-family: ${fontStack()}; font-size: 12px; line-height: 1.5; color: ${BRAND.muted};">
      Don't want these weekly emails? <a href="${unsubscribeUrl}" style="color: ${BRAND.lime}; text-decoration: none;">Unsubscribe</a>
    </p>
  `;

  return renderDinkHouseEmail({
    siteUrl,
    preheader: entry.preheader,
    eyebrow: `Week ${entry.week} · ${THEME_LABELS[entry.theme]}`,
    heading: entry.heading,
    heroHtml: emailHero(entry.heroSrc, entry.heroAlt),
    bodyHtml,
    cta: { label: "Follow the build", href: FOLLOW_URL },
  });
}

export function generateWeeklyEmailText(
  week: number,
  data: WeeklyEmailData,
): string {
  const entry = getWeeklyEmail(week);
  const siteUrl = (data.site_url || BRAND.defaultSiteUrl).replace(/\/$/, "");
  const unsubscribeUrl = data.unsubscribe_url || `${siteUrl}/unsubscribe`;

  return `THE DINK HOUSE
${BRAND.tagline}

WEEK ${entry.week} · ${THEME_LABELS[entry.theme].toUpperCase()}
${entry.heading.toUpperCase()}

Hi ${data.first_name},

${entry.intro.join("\n\n")}

${entry.tryThisTitle.toUpperCase()}
${entry.tryThis}

TELL US HOW IT WENT
Hit reply — we read every note. And bring a friend to the courts this week.

Follow the build: ${FOLLOW_URL}

See you on the courts,
The Dink House Team

Visit: ${siteUrl}
Unsubscribe: ${unsubscribeUrl}
Questions? ${BRAND.supportEmail}
`;
}
