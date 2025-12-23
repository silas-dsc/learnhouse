import { marked } from 'marked';

const testMarkdown = `# Introduction to Cat Basics: A Comprehensive Online Course Start 🐾

Welcome to Cat Basics: A Comprehensive Online Course Start 🐾

This course is designed to equip you with the essential knowledge and tools necessary to become an effective and loving cat caretaker. Dive deep into the world of feline wellness with this multifaceted program, which blends practical training, scientific insights, and ethical care. Let's embark on this enriching journey.

## Module 1: The Anatomy of a Cat 🔍

**Microscopic Marvels:**
- **Feline Whiskers:** These delicate appendages serve as sensory receptors, crucial for navigating the world around them.
- **Paws:** The paws provide mobility and sensory input, essential for agile movement and environmental interaction.
- **Ears:** Cats possess exceptional hearing, and their ears are an extension of their sense of sight and smell, enabling them to respond to threats and opportunities in their environment.

**Beyond the Surface:**
- **Temperature Regulation:** Cats thrive in environments that mimic their natural habitats, providing the right warmth and airflow.
- **Exercise Levels:** Regular physical activity boosts their physical and mental well-being, reducing stress and enhancing agility.
- **Mental Stimulation:** Interactive toys and puzzle feeders keep cats mentally sharp, fostering a strong bond.

**Visual Insights:**
- **Cat's Eyes:** These windows to the world are filled with a myriad of information, influencing their behavior and mood.
- **Nose:** Often overlooked, the nose plays a critical role in scent detection, guiding hunting and social interactions.

## Module 2: The Vital Role of Pheromones 💧

**Pheromone Symphony:**
- **Scent Marking:** These chemical signals dictate social interactions, marking territory, and signaling affection.
- **Health Indicators:** Pheromones can alert cats to stress, illness, and environmental dangers, making them a crucial tool in health management.

**Pheromone Testing:**
- **Pheromone Detectors:** Essential for understanding a cat's emotional state and environmental needs.
- **Feline Social Dynamics:** Pheromones play a pivotal role in social bonding, marking territory, and initiating affectionate behaviors.

## Module 3: The Environment Influences on Cat Health 🌱

**Habitat Design:**
- **Temperature Regulation:** Cats thrive in environments that mimic their natural habitats, providing the right warmth and airflow.
- **Exercise Levels:** Regular physical activity promotes both physical and mental well-being, reducing stress and enhancing agility.
- **Mental Stimulation:** Interactive toys and puzzle feeders keep cats mentally sharp, fostering a strong bond.

**Wellness Maintenance:**
- **Environmental Enrichment:** Provide toys, scratching posts, and varied hiding spots to keep cats mentally and physically stimulated.
- **Healthy Diet:** Tailored nutrition supports overall health, reducing the risk of obesity and other health issues.

### The Art of Cat Care 🐾

#### Daily Routines:

**Grooming Essentials:**
- **Brushing Frequency:** Establish a regular brushing schedule to maintain a healthy coat and remove dirt and debris.
- **Grooming Tools:** Use a slicker brush for a thorough clean and a nail clipper for precision trimming.
- **Feeding Schedule:** Consistency in feeding helps with dental hygiene and overall health.

#### Practical Tips:

**Hand Hygiene:**
- **Clean Hands:** Regularly wash your hands to avoid contamination and maintain hygiene standards.
- **Cat-Safe Cleaning Products:** Opt for pet-safe, cat-safe grooming products to ensure a safe and effective cleaning experience.

#### Health Monitoring:

**Regular Vet Check-ups:**
- **Routine Visits:** Schedule regular veterinary visits to monitor your cat's health, detect early signs of illness, and receive appropriate treatment.
- **Parousia Care:** Keep a detailed record of your cat's health, including dietary changes and environmental adjustments.

#### Positive Interaction:

**Training Techniques:**
- **Positive Reinforcement:** Use treats and praise to train your cat, fostering a strong bond and ensuring a well-adjusted companion.
- **Consistency:** Maintain consistency in training commands and responses to reinforce positive outcomes.

### Conclusion: A Catalyst for Change 🚀

Cat Basics promises to be more than just a comprehensive training module; it's a catalyst for transforming your relationship with your feline friend. This course, with its blend of theory and practical application, equips you with the knowledge and tools to care for your cat with the expertise and compassion you need. Embrace this transformative journey, and watch as your cat's health, well-being, and happiness flourish. This comprehensive online`;

function parseMarkdownToNodes(markdownText) {
  const tokens = marked.lexer(markdownText);

  function parseInlineTokens(tokens) {
    if (!tokens || tokens.length === 0) {
      return [{ type: 'text', text: '' }];
    }

    const content = [];
    
    for (const token of tokens) {
      if (token.type === 'text') {
        content.push({ type: 'text', text: token.text });
      } else if (token.type === 'strong') {
        content.push({
          type: 'text',
          marks: [{ type: 'bold' }],
          text: token.text,
        });
      } else if (token.type === 'em') {
        content.push({
          type: 'text',
          marks: [{ type: 'italic' }],
          text: token.text,
        });
      } else if (token.type === 'codespan') {
        content.push({
          type: 'text',
          marks: [{ type: 'code' }],
          text: token.text,
        });
      } else if (token.type === 'br') {
        content.push({ type: 'hardBreak' });
      } else if (token.type === 'link') {
        content.push({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: token.href } }],
          text: token.text,
        });
      } else {
        // Fallback for unknown inline token types
        content.push({ type: 'text', text: token.text || token.raw || '' });
      }
    }
    
    return content.length > 0 ? content : [{ type: 'text', text: '' }];
  }

  const nodes = [];

  for (const token of tokens) {
    if (token.type === 'heading') {
      nodes.push({
        type: 'heading',
        attrs: { level: token.depth },
        content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
      });
    } else if (token.type === 'paragraph') {
      nodes.push({
        type: 'paragraph',
        content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
      });
    } else if (token.type === 'list') {
      const listNode = {
        type: token.ordered ? 'orderedList' : 'bulletList',
        content: token.items.map((item) => {
          // Extract inline tokens from the first paragraph token in the list item
          let inlineContent = [{ type: 'text', text: item.text }];
          
          if (item.tokens && item.tokens.length > 0) {
            // Find the first paragraph token and extract its inline tokens
            const paragraphToken = item.tokens.find(t => t.type === 'paragraph' || t.type === 'text');
            if (paragraphToken && paragraphToken.tokens) {
              inlineContent = parseInlineTokens(paragraphToken.tokens);
            }
          }
          
          return {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: inlineContent,
            }],
          };
        }),
      };
      nodes.push(listNode);
    } else if (token.type === 'blockquote') {
      nodes.push({
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: token.tokens ? parseInlineTokens(token.tokens) : [{ type: 'text', text: token.text }],
        }],
      });
    } else if (token.type === 'code') {
      nodes.push({
        type: 'codeBlock',
        attrs: { language: token.lang || null },
        content: [{ type: 'text', text: token.text }],
      });
    } else if (token.type === 'table') {
      const tableNode = {
        type: 'table',
        content: token.rows.map((row) => ({
          type: 'tableRow',
          content: row.map((cell) => ({
            type: 'tableCell',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: cell }],
            }],
          })),
        })),
      };
      nodes.push(tableNode);
    } else if (token.type === 'space') {
      // Skip space tokens - they're just blank lines between blocks
      continue;
    }
  }

  return nodes;
}

console.log('Testing Markdown Parser...\n');
console.log('Input markdown length:', testMarkdown.length);

const result = parseMarkdownToNodes(testMarkdown);

console.log('\nParsed nodes count:', result.length);
console.log('\n--- Parsed Structure ---\n');
console.log(JSON.stringify(result, null, 2));

// Verify key elements
console.log('\n--- Verification ---');
console.log('First heading:', result[0]?.type === 'heading' ? '✓' : '✗');
console.log('Has lists:', result.some(n => n.type === 'bulletList') ? '✓' : '✗');
console.log('Has bold text in lists:', 
  result.filter(n => n.type === 'bulletList').some(list => 
    list.content.some(item => 
      item.content[0].content.some(c => c.marks?.some(m => m.type === 'bold'))
    )
  ) ? '✓' : '✗'
);
