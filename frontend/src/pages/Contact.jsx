import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <div className="contact-container">
        <h1>Contact Us</h1>
      </div>
      <section className="page-container">
        <h2>Get in Touch</h2>
        <p>
          If you have any questions or feedback, feel free to contact us using
          the form below or through our social media channels.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text" id="name" placeholder="Your Name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email" id="email" placeholder="Your Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label htmlFor="message">Message:</label>
          <textarea
            id="message" rows="5" placeholder="Your Message" required
            value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          ></textarea>

          <button type="submit">Send Message</button>
        </form>
        {sent && <p style={{ color: "#e5533f", marginTop: "10px" }}>Thanks! We'll get back to you soon.</p>}

        <h2>📍 Our Location</h2>
        <p>123 Food Street, Food City, FC 45678</p>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Food+City"
            allowFullScreen
            title="location-map"
          ></iframe>
        </div>

        <h2>🕒 Business Hours</h2>
        <p><strong>Monday - Friday:</strong> 10:00 AM - 10:00 PM</p>
        <p><strong>Saturday - Sunday:</strong> 12:00 PM - 11:00 PM</p>

        <button className="chat-btn">💬 Live Chat</button>
      </section>
    </>
  );
}
