
export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 40, fontFamily: "Arial" }}>
      <h1>Medical Appointment Assistance in China</h1>
      <h3>For Foreigners · PayPal Protected · Fully Refundable</h3>
      <p>
        We help foreigners book hospital appointments in China and provide
        on-site medical escort services.  
        <strong> If booking fails, you get a full refund.</strong>
      </p>
      <hr />
      <h2>Why You Can Trust Us</h2>
      <ul>
        <li>Pay securely via PayPal (Buyer Protection)</li>
        <li>Funds are held until appointment is confirmed</li>
        <li>100% refund if booking fails</li>
        <li>Human-assisted service (not bots)</li>
      </ul>
      <hr />
      <h2>How It Works</h2>
      <ol>
        <li>Submit your request and pay via PayPal</li>
        <li>We attempt booking within 24–72 hours</li>
        <li>
          Success → appointment confirmed → service delivered<br/>
          Failure → full refund via PayPal
        </li>
      </ol>
      <hr />
      <h2>Pricing</h2>
      <ul>
        <li>Appointment booking only: <strong>$99</strong></li>
        <li>Booking + hospital escort: <strong>$249</strong></li>
        <li>VIP / complex cases: <strong>From $499</strong></li>
      </ul>
      <p style={{ marginTop: 30 }}>
        <strong>Disclaimer:</strong>  
        We are not a medical provider. We only provide appointment assistance
        and escort services.
      </p>
      <button style={{ marginTop: 30, padding: "14px 28px", fontSize: 16, cursor: "pointer" }}>
        Proceed with PayPal (Refundable)
      </button>
    </main>
  );
}
