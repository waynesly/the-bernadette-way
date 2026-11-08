/* Approved, local-only leadership profile library. No AI or network calls. */
(function () {
  const themes = {
    encouraging_connector: {
      title: 'Encouraging Connector',
      icon: '♡',
      studentStory: 'Your answers suggest you may notice when people need encouragement or a place in the group. You can make a difference by listening, including others and helping people feel they belong.',
      studentLead: 'You may lead by making space for every voice, checking in on a teammate and helping your group work kindly together.',
      studentAction: 'In your next group task, invite one quieter person to share an idea before the group decides.',
      familyStory: 'This pattern suggests your child may be especially aware of relationships and belonging. Their leadership can show up in small, powerful ways: listening, including, encouraging and helping a group feel safe.',
      familyAction: 'Ask: “When did you help someone feel included this week?” Notice the effort, rather than expecting your child to always look after everyone else.',
      teacherContribution: 'May strengthen belonging, peer support and shared participation. This student may notice who has not yet joined in.',
      teacherOpportunity: 'Invite them to welcome a partner, gather quieter ideas or support inclusive group norms—without making them responsible for everyone’s wellbeing.',
      teacherPrompt: 'What helps people feel safe enough to share an idea in a group?'
    },
    fair_minded_guide: {
      title: 'Fair-Minded Guide',
      icon: '⚖',
      studentStory: 'Your answers suggest you may care about doing what is fair, listening to different views and making choices you can stand behind. You may help a group when people need a calm and respectful way forward.',
      studentLead: 'You may lead by making sure people are heard, checking that rules are fair and helping a group make thoughtful choices.',
      studentAction: 'During a disagreement, try saying: “Let’s hear each person’s idea before we decide.”',
      familyStory: 'This pattern suggests your child may value fairness, honesty and thoughtful decision-making. Their leadership is likely to be strongest when they can help a group hear different perspectives.',
      familyAction: 'Talk through a small family decision together. Ask what would make the choice fair for everyone involved.',
      teacherContribution: 'May bring fairness, evidence and respectful perspective-taking to group decisions.',
      teacherOpportunity: 'Offer roles such as discussion chair, criteria checker or peer mediator in low-stakes collaborative tasks.',
      teacherPrompt: 'How can we make a decision that is fair, even when people want different things?'
    },
    curious_problem_solver: {
      title: 'Curious Problem-Solver',
      icon: '✦',
      studentStory: 'Your answers suggest you may be energised by questions, new ideas and discovering how things work. You may lead by helping a group look beyond the first answer and explore possibilities.',
      studentLead: 'You may lead by asking useful questions, connecting ideas and encouraging your team to test a creative solution.',
      studentAction: 'Choose one class problem this week and ask: “What are three different ways we could try this?”',
      familyStory: 'This pattern suggests your child may be motivated by exploration, learning and original ideas. Their leadership may appear when a group needs a fresh question or a new approach.',
      familyAction: 'When your child asks a question, explore it together before rushing to an answer. Celebrate persistence in finding out.',
      teacherContribution: 'May generate options, inquiry questions and novel approaches when a group is stuck.',
      teacherOpportunity: 'Use open-ended investigations, design roles or “question captain” responsibilities that value exploration as well as answers.',
      teacherPrompt: 'What question could help our group see this challenge in a new way?'
    },
    steady_organiser: {
      title: 'Steady Organiser',
      icon: '◎',
      studentStory: 'Your answers suggest you may help things move forward by planning, sticking with important work and thinking carefully before acting. You can be a calming presence when a group has a big task to complete.',
      studentLead: 'You may lead by breaking a goal into steps, keeping track of what is next and encouraging others to keep going.',
      studentAction: 'For your next group task, help make a simple plan: first, next, then and check.',
      familyStory: 'This pattern suggests your child may bring care, persistence and thoughtful planning to their work. Their leadership may be most visible when a group needs structure and follow-through.',
      familyAction: 'Let your child plan one manageable family task from start to finish. Praise the process of planning, adapting and completing it.',
      teacherContribution: 'May support follow-through, time awareness and calm task management in collaborative work.',
      teacherOpportunity: 'Offer roles such as materials manager, plan maker or progress checker, while ensuring they are not always assigned the organising work.',
      teacherPrompt: 'What is one small next step that will help our team keep moving?'
    },
    courageous_advocate: {
      title: 'Courageous Advocate',
      icon: '▲',
      studentStory: 'Your answers suggest you may be willing to speak up for what matters, especially when something does not feel right. You may help a group act with honesty and care.',
      studentLead: 'You may lead by sharing your view respectfully, standing up for fair treatment and helping others feel brave enough to do the right thing.',
      studentAction: 'Practise one respectful sentence for speaking up: “I see it differently because…”',
      familyStory: 'This pattern suggests your child may be prepared to act on their values, even when a situation feels challenging. Their leadership benefits from learning how to be brave and respectful at the same time.',
      familyAction: 'Share a time when you had to say something difficult kindly. Help your child practise words for asking for help or speaking up safely.',
      teacherContribution: 'May bring moral courage, directness and a strong sense of right action to a group.',
      teacherOpportunity: 'Use structured discussion protocols and provide language for respectful disagreement, help-seeking and bystander action.',
      teacherPrompt: 'How can we speak up for what is right while still treating people with respect?'
    },
    hopeful_motivator: {
      title: 'Hopeful Motivator',
      icon: '☀',
      studentStory: 'Your answers suggest you may bring optimism, energy and encouragement when things are difficult. You may help a group keep its eyes on what is possible and take the next step.',
      studentLead: 'You may lead by celebrating progress, helping others recover after setbacks and bringing positive energy to shared goals.',
      studentAction: 'When a task gets hard, name one thing your group has already achieved and one next step it can take.',
      familyStory: 'This pattern suggests your child may help others keep going through enthusiasm, hope and a focus on possibilities. Their leadership grows when optimism is paired with realistic planning.',
      familyAction: 'After a setback, ask: “What did we learn, and what could we try next?” Celebrate effort and improvement, not just success.',
      teacherContribution: 'May lift group morale, encourage persistence and help classmates re-engage after difficulty.',
      teacherOpportunity: 'Invite them to identify progress markers or give a closing encouragement after a group challenge.',
      teacherPrompt: 'What is one sign that our team is moving forward, even if the work is not finished yet?'
    },
    reflective_adviser: {
      title: 'Reflective Adviser',
      icon: '◌',
      studentStory: 'Your answers suggest you may like to pause, think things through and notice the bigger picture. You may help a group by offering a considered idea when people need perspective.',
      studentLead: 'You may lead by asking what matters most, noticing possible consequences and helping a group choose a wise next step.',
      studentAction: 'Before a decision, ask your group: “What might happen next, and what matters most here?”',
      familyStory: 'This pattern suggests your child may take time to reflect and consider what matters. Their leadership may be quieter, but it can offer valuable perspective and thoughtful advice.',
      familyAction: 'Give your child time to think before expecting an answer. Ask what they noticed, what matters and what they would recommend.',
      teacherContribution: 'May offer perspective, careful judgement and a values-based view of a problem.',
      teacherOpportunity: 'Build in think time before discussion and invite this student to share a considered summary or next-step question.',
      teacherPrompt: 'What might be important here that we have not thought about yet?'
    },
    joyful_includer: {
      title: 'Joyful Team Builder',
      icon: '☻',
      studentStory: 'Your answers suggest you may bring warmth, humour and energy that can help people enjoy working together. You may help a team feel more connected and ready to join in.',
      studentLead: 'You may lead by using kindness and appropriate fun to welcome people, lift the mood and keep a group connected.',
      studentAction: 'At your next group activity, try one kind way to lift the mood while keeping everyone focused on the goal.',
      familyStory: 'This pattern suggests your child may create connection through warmth, enthusiasm and appropriate humour. Their leadership can help a group feel positive and ready to participate.',
      familyAction: 'Notice when your child uses humour or energy kindly. Talk about the difference between lifting a group up and distracting it.',
      teacherContribution: 'May build group energy, connection and participation through warmth and appropriate humour.',
      teacherOpportunity: 'Use roles such as welcome host, celebration lead or team climate checker, with clear expectations about focus and inclusion.',
      teacherPrompt: 'What can we do to help this group feel both positive and ready to learn?'
    }
  };

  const themeStrengths = {
    encouraging_connector: ['Kindness','Teamwork','Social Intelligence','Love','Fairness','Humour'],
    fair_minded_guide: ['Fairness','Open-mindedness','Honesty','Perspective','Leadership','Humility'],
    curious_problem_solver: ['Curiosity','Creativity','Love of Learning','Appreciation of Beauty','Zest'],
    steady_organiser: ['Prudence','Self-regulation','Perseverance','Leadership','Open-mindedness'],
    courageous_advocate: ['Bravery','Honesty','Fairness','Leadership','Hope'],
    hopeful_motivator: ['Hope','Zest','Gratitude','Perseverance','Leadership','Humour'],
    reflective_adviser: ['Perspective','Open-mindedness','Spirituality','Gratitude','Humility','Prudence'],
    joyful_includer: ['Humour','Love','Zest','Kindness','Teamwork','Social Intelligence']
  };

  function listWords(items) {
    if (items.length < 2) return items[0] || '';
    if (items.length === 2) return items[0] + ' and ' + items[1];
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  function scoreThemes(scores) {
    return Object.entries(themeStrengths).map(([key, strengths]) => {
      const total = strengths.reduce((sum, strength) => sum + Math.max(0, Number(scores[strength] || 0) - 3), 0);
      const matches = strengths.filter(strength => Number(scores[strength] || 0) >= 16);
      return { key, total, matches };
    }).sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
  }

  function createLeadershipProfile(scores) {
    const rankedStrengths = Object.entries(scores || {}).sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]));
    const topStrengths = rankedStrengths.slice(0, 5).map(([name]) => name);
    const rankedThemes = scoreThemes(scores || {});
    const primary = rankedThemes[0] || { key: 'encouraging_connector', matches: [] };
    const supporting = rankedThemes.filter(theme => theme.key !== primary.key && theme.total >= primary.total - 3).slice(0, 2);
    const primaryTheme = themes[primary.key];
    const matchingStrengths = primary.matches.length ? primary.matches.slice(0, 3) : topStrengths.slice(0, 3);
    return {
      primaryKey: primary.key,
      title: primaryTheme.title,
      icon: primaryTheme.icon,
      topStrengths,
      matchingStrengths,
      supporting: supporting.map(theme => themes[theme.key].title),
      studentStory: primaryTheme.studentStory,
      studentLead: primaryTheme.studentLead,
      studentAction: primaryTheme.studentAction,
      familyStory: primaryTheme.familyStory,
      familyAction: primaryTheme.familyAction,
      teacherContribution: primaryTheme.teacherContribution,
      teacherOpportunity: primaryTheme.teacherOpportunity,
      teacherPrompt: primaryTheme.teacherPrompt,
      summary: 'Your answers today show a pattern around ' + listWords(matchingStrengths) + '.'
    };
  }

  const strengthContributions = {
    'Appreciation of Beauty':'notice quality, effort and moments of wonder that can inspire a group',
    'Bravery':'speak up respectfully when something matters or feels unfair',
    'Creativity':'offer original ideas and imagine a different way forward',
    'Curiosity':'ask questions that help a group explore beyond its first answer',
    'Fairness':'help people receive a fair chance and a respectful hearing',
    'Forgiveness':'help repair a relationship and move forward after a mistake',
    'Gratitude':'notice contributions and help others feel valued',
    'Honesty':'build trust by being genuine and taking responsibility',
    'Hope':'help a group see a possible next step after a setback',
    'Humility':'make room for others and share success rather than seeking the spotlight',
    'Humour':'use appropriate fun to help people feel more comfortable and connected',
    'Open-mindedness':'consider another point of view before deciding',
    'Kindness':'notice when someone may need practical care or encouragement',
    'Leadership':'help people work together around a shared purpose',
    'Love':'build warm, trusting relationships with people who matter',
    'Love of Learning':'keep developing skills and share what you discover',
    'Perseverance':'keep working when a worthwhile task becomes difficult',
    'Perspective':'pause to see the bigger picture and offer a thoughtful suggestion',
    'Prudence':'think ahead about choices, consequences and what the group needs next',
    'Self-regulation':'bring a calm pause when feelings or pressure are rising',
    'Social Intelligence':'read the room and respond thoughtfully to other people',
    'Spirituality':'connect choices to values, meaning or what matters most',
    'Teamwork':'help people cooperate reliably toward a shared goal',
    'Zest':'bring positive energy and momentum to a shared challenge'
  };

  const pairInsights = {
    'Creativity|Curiosity':'bring fresh questions and imaginative ideas when a group is stuck',
    'Fairness|Honesty':'help build trust by encouraging fair and truthful choices',
    'Fairness|Teamwork':'help a group include people and share decisions fairly',
    'Hope|Perseverance':'help a group recover from setbacks and keep going',
    'Kindness|Social Intelligence':'notice what others may need and respond with care',
    'Kindness|Teamwork':'help a group feel supported while it works toward a goal',
    'Humility|Leadership':'guide a group while still making room for every person',
    'Leadership|Teamwork':'help a group organise itself and work toward a shared goal',
    'Curiosity|Love of Learning':'turn questions into discovery and share new learning',
    'Open-mindedness|Perspective':'help a group slow down, consider different views and make a wiser choice',
    'Prudence|Self-regulation':'bring calm, thoughtful choices when a situation feels rushed',
    'Bravery|Fairness':'speak up respectfully when someone needs a fair chance',
    'Gratitude|Kindness':'notice people’s contributions and help them feel valued',
    'Humour|Zest':'bring warm energy that helps a group connect and participate'
  };

  function pairKey(a, b) { return [a, b].sort().join('|'); }
  function describeBlend(topStrengths) {
    for (let i = 0; i < topStrengths.length; i++) {
      for (let j = i + 1; j < topStrengths.length; j++) {
        const insight = pairInsights[pairKey(topStrengths[i], topStrengths[j])];
        if (insight) return insight;
      }
    }
    return (strengthContributions[topStrengths[0]] || 'make a positive contribution') + ', while also using ' + String(topStrengths[1] || 'your other strengths').toLowerCase();
  }

  function createRichLeadershipProfile(scores) {
    const rankedStrengths = Object.entries(scores || {}).sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]));
    const topStrengths = rankedStrengths.slice(0, 5).map(([name]) => name);
    const rankedThemes = scoreThemes(scores || {});
    const primary = rankedThemes[0] || { key: 'encouraging_connector', matches: [] };
    const primaryTheme = themes[primary.key];
    const supportThemes = rankedThemes.filter(theme => theme.key !== primary.key && theme.total >= primary.total - 3).slice(0, 2);
    const styles = [primaryTheme.title].concat(supportThemes.map(theme => themes[theme.key].title));
    const matchingStrengths = primary.matches.length ? primary.matches.slice(0, 3) : topStrengths.slice(0, 3);
    const blend = describeBlend(topStrengths);
    const classroomContributions = topStrengths.slice(0, 3).map(strength => ({
      strength,
      contribution: strengthContributions[strength] || 'make a positive contribution to the group'
    }));
    return {
      primaryKey: primary.key,
      title: primaryTheme.title,
      icon: primaryTheme.icon,
      topStrengths,
      matchingStrengths,
      styles,
      supporting: styles.slice(1),
      blend,
      classroomContributions,
      studentStory: 'Your answers today suggest a pattern that may help you ' + blend + '. Your strengths in ' + listWords(topStrengths.slice(0, 3)) + ' may be especially useful when you are working with other people.',
      studentLead: 'In leadership, you may be most comfortable as an ' + primaryTheme.title + '. ' + primaryTheme.studentLead,
      studentAction: primaryTheme.studentAction,
      familyStory: primaryTheme.familyStory + ' Together, ' + listWords(topStrengths.slice(0, 3)) + ' may help your child ' + blend + '.',
      familyAction: primaryTheme.familyAction,
      teacherContribution: primaryTheme.teacherContribution + ' Their strongest combination may help them ' + blend + '.',
      teacherOpportunity: primaryTheme.teacherOpportunity,
      teacherPrompt: primaryTheme.teacherPrompt,
      summary: 'Your top strengths—' + listWords(topStrengths.slice(0, 3)) + '—suggest you may lead as an ' + primaryTheme.title + '.'
    };
  }

  const strengthDetails = {
    'Appreciation of Beauty': { meaning:'Noticing and valuing beauty, talent, effort and quality.', school:'Admiring a classmate’s artwork, enjoying nature, or recognising when someone has worked hard.' },
    'Bravery': { meaning:'Facing fears, challenges or unfair situations.', school:'Asking for help, trying something new, or speaking up when something is wrong.' },
    'Creativity': { meaning:'Using imagination to make, design or solve things in new ways.', school:'Finding a different way to complete a task or coming up with an original story idea.' },
    'Curiosity': { meaning:'Wanting to ask questions, explore and discover.', school:'Wondering how something works and looking for answers.' },
    'Fairness': { meaning:'Treating people with respect and giving everyone a fair chance.', school:'Including others in a game and applying the same rules to everyone.' },
    'Forgiveness': { meaning:'Moving forward after someone has hurt or upset you.', school:'Accepting an apology and not holding a mistake over someone forever.' },
    'Gratitude': { meaning:'Noticing what is good and being thankful for it.', school:'Thanking a friend, teacher or family member for their support.' },
    'Honesty': { meaning:'Being truthful, genuine and responsible for your actions.', school:'Admitting you made a mistake instead of blaming someone else.' },
    'Hope': { meaning:'Believing you can work towards a positive future.', school:'Setting a goal after a poor result and making a plan to improve.' },
    'Humility': { meaning:'Knowing your strengths without needing to show off.', school:'Being proud of an achievement while also recognising the help you received.' },
    'Humour': { meaning:'Finding and sharing appropriate fun or laughter.', school:'Using a kind joke to lift the mood when a group feels stressed.' },
    'Open-mindedness': { meaning:'Thinking carefully before deciding what you believe or do. This strength is also often called Judgment.', school:'Listening to different opinions, checking information and changing your mind when evidence is strong.' },
    'Kindness': { meaning:'Caring for others through helpful words and actions.', school:'Helping someone who is stuck or checking in on a classmate.' },
    'Leadership': { meaning:'Helping people work together towards a shared goal.', school:'Organising a group task, listening to others and encouraging everyone to contribute.' },
    'Love': { meaning:'Building close relationships with care, trust and warmth.', school:'Showing family and friends that they matter to you.' },
    'Love of Learning': { meaning:'Enjoying the process of learning and improving.', school:'Practising a skill because you want to get better, not only for a grade.' },
    'Perseverance': { meaning:'Continuing to work towards a goal when things are difficult.', school:'Revising a challenging topic rather than giving up after the first attempt.' },
    'Perspective': { meaning:'Seeing the bigger picture and giving thoughtful advice.', school:'Helping friends think through a problem from more than one point of view.' },
    'Prudence': { meaning:'Thinking ahead and making careful choices.', school:'Planning your time, checking work before submitting it, or considering consequences.' },
    'Self-regulation': { meaning:'Managing feelings, choices, attention and habits.', school:'Taking a pause before reacting angrily or staying focused despite distractions.' },
    'Social Intelligence': { meaning:'Understanding feelings—your own and other people’s.', school:'Noticing when someone feels left out and responding in a caring way.' },
    'Spirituality': { meaning:'Finding meaning, purpose or connection beyond everyday tasks.', school:'Reflecting on what matters to you, your values, beliefs, community or the natural world.' },
    'Teamwork': { meaning:'Working reliably and respectfully with others.', school:'Doing your share, sharing ideas and supporting group members.' },
    'Zest': { meaning:'Bringing energy, enthusiasm and interest to life.', school:'Joining in with a positive attitude and giving activities your best effort.' }
  };

  const leadershipStyleDetails = {
    'Encouraging Connector':'Brings people together and helps others feel seen, heard and valued. At school, they may notice when someone has not had a turn and invite their perspective.',
    'Fair-Minded Guide':'Considers different viewpoints and works toward respectful, equitable choices. At school, they may help a group share tasks fairly or hear each person before deciding.',
    'Curious Problem-Solver':'Investigates challenges instead of jumping to conclusions. At school, they may ask useful questions, test an idea and suggest a practical improvement.',
    'Steady Organiser':'Creates order when things feel busy or uncertain. At school, they may clarify roles, make a simple plan and help the group follow through.',
    'Courageous Advocate':'Speaks up respectfully when something is unfair, unsafe or does not match shared values. At school, they may help make sure someone is included or ask an adult for support.',
    'Hopeful Motivator':'Helps others stay focused and confident after disappointment or during change. At school, they may acknowledge a challenge and help the group find its next step.',
    'Reflective Adviser':'Offers measured, thoughtful guidance and helps people think through choices. At school, they may pause a group to consider what matters most or what could happen next.',
    'Joyful Team Builder':'Creates positive energy and shared purpose. At school, they may celebrate progress, welcome others and use appropriate fun to help a group connect.'
  };

  window.LEADERSHIP_PROFILES = { createLeadershipProfile: createRichLeadershipProfile, themes, strengthDetails, leadershipStyleDetails };
}());