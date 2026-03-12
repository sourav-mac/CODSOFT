export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export function getBotResponse(input: string): string {
  const msg = input.toLowerCase().trim();

  // Greeting
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! Welcome to the College Information Chatbot. How can I help you?";
  }

  // Admission
  if (msg.includes("admission")) {
    return "The admission process usually starts in June. Please visit the college website for detailed information.";
  }

  // Courses
  if (msg.includes("course")) {
    return "Our college offers B.Tech, BCA, BBA, and other undergraduate programs.";
  }

  // Fees
  if (msg.includes("fee")) {
    return "Fees vary depending on the course. Please contact the administration office for exact details.";
  }

  // Hostel
  if (msg.includes("hostel")) {
    return "We have separate hostel facilities for boys and girls with 24/7 security, Wi-Fi, and mess services.";
  }

  // Timings
  if (msg.includes("timing") || msg.includes("time") || msg.includes("schedule")) {
    return "College timings are from 9:00 AM to 4:30 PM, Monday to Saturday.";
  }

  // Contact
  if (msg.includes("contact") || msg.includes("phone") || msg.includes("email")) {
    return "You can reach us at info@college.edu or call us at +91-1234567890.";
  }

  // Exit
  if (msg.includes("bye") || msg.includes("exit")) {
    return "Goodbye! Have a great day. 👋";
  }

  return "Sorry, I didn't understand that. Please ask about admission, courses, fees, hostel, or contact information.";
}

export function isExitMessage(input: string): boolean {
  const msg = input.toLowerCase().trim();
  return msg.includes("bye") || msg.includes("exit");
}
