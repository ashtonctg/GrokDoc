import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const openai = new OpenAI();

    // Test both formats
    const testMessages = [
      // Test 1: URL format
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Test 1 - URL Image: What's in this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      },
      // Test 2: Base64 format
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Test 2 - Base64 Image: What's in this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            }
          }
        ]
      }
    ];

    // Run both tests
    const results = await Promise.all(testMessages.map(async (message) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [message],
      });
      return {
        test: message.content[0].text,
        response: response.choices[0].message.content
      };
    }));

    return res.status(200).json({ 
      success: true,
      results 
    });
  } catch (error) {
    console.error('Vision Test Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data || error
    });
  }
} 