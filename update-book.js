require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function updateBook() {
  const bookId = 'book-1781171693015'; // Training Guide
  const title = 'Self Confidence Expert: How to Win More in Life';
  const description = `⭐⭐⭐⭐⭐ A Transformational Training Guide

Are you tired of motivation that fades overnight? Ready for confidence that actually lasts?

This powerful guide cuts through the noise of the modern self-esteem movement to reveal the one thing that creates unstoppable self-confidence — competence. Not affirmations. Not participation trophies. Real, measurable, proven ability.

Inside, you'll discover:
- Why "hollow" self-esteem leads to impostor syndrome and how to escape it
- The competence-confidence feedback loop — the upward spiral that top performers use to keep winning
- A practical 5-step framework to build unshakeable self-confidence starting from where you are today
- How to identify your existing strengths, systematically improve them, and expand ownership across every area of your life
- The truth about the Dunning-Kruger effect — and how self-aware people use it to their advantage

Whether you're building a career, a business, or simply a better life, this guide gives you the tools to perform at a high level on demand — regardless of circumstances, emotions, or how the day is going.

Real confidence isn't something you feel. It's something you do.

Perfect for entrepreneurs, students, professionals, and anyone ready to stop talking about success and start creating it.`;

  const { data, error } = await supabase
    .from('Book')
    .update({ title, description })
    .eq('id', bookId)
    .select();

  if (error) {
    console.error('Error updating book:', error.message);
  } else {
    console.log('Successfully updated book:', data);
  }
}

updateBook();
