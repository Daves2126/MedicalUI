// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Create a readable stream for the response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Sample medical response for testing
        const sampleResponse = `Thank you for your question about medical information. As your AI medical assistant, I'm here to help provide general health information and guidance.

Please remember that while I can offer educational information about symptoms, conditions, and general health topics, this should never replace professional medical advice from a qualified healthcare provider.

If you're experiencing concerning symptoms or have specific health questions, I always recommend consulting with your doctor or healthcare professional who can provide personalized medical advice based on your individual health history and current condition.

Is there a specific health topic or concern you'd like to learn more about today?`;
        
        const simulateTyping = async () => {
          // Split response into words for more natural typing effect
          const words = sampleResponse.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            const data = JSON.stringify({ content: word });
            controller.enqueue(encoder.encode(`0:${data}\n`));
            
            // Variable delay to simulate natural typing
            const delay = Math.random() * 50 + 30; // 30-80ms delay
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          controller.close();
        };
        
        simulateTyping().catch(error => {
          console.error('Streaming error:', error);
          controller.error(error);
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
