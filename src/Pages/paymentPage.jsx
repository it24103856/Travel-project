import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// CSS Styles
const styles = {
    container: { border: '2px solid black', padding: '20px', width: '300px', margin: 'auto', borderRadius: '10px' },
    header: { textAlign: 'center', borderBottom: '1px solid gray' },
    details: { margin: '20px 0' },
    methodGrid: { display: 'flex', gap: '10px', justifyContent: 'center' },
    methodBox: { padding: '10px', cursor: 'pointer', borderRadius: '5px', fontSize: '12px', textAlign: 'center' },
    payBtn: { marginTop: '20px', width: '100%', padding: '10px', borderRadius: '20px', backgroundColor: '#eee', cursor: 'pointer', fontWeight: 'bold' }
};

const PaymentMainPage = ({ bookingDetails }) => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const navigate = useNavigate();

    const { bookingId, discount, total } = bookingDetails || {
        bookingId: "BK12345",
        discount: "10%",
        total: "5000 LKR"
    };

    const handlePayNow = () => {
        if (!selectedMethod) {
            alert("කරුණාකර ගෙවීම් ක්‍රමයක් තෝරන්න!");
            return;
        }

        // තෝරාගත් ක්‍රමය අනුව අදාළ Page එකට යොමු කිරීම
        if (selectedMethod === 'card') navigate('/payment/card');
        else if (selectedMethod === 'bank') navigate('/payment/bank-transfer');
        else if (selectedMethod === 'crypto') navigate('/payment/crypto');
    };

    return (
        <div className="payment-container" style={styles.container}>
            <h2 style={styles.header}>Payment</h2>
            
            <div className="details-section" style={styles.details}>
                <p><strong>Booking ID:</strong> {bookingId}</p>
                <p><strong>Discount:</strong> {discount}</p>
                <p><strong>Total:</strong> {total}</p>
            </div>

            <div className="method-section">
                <p>Payment Methods</p>
                <div style={styles.methodGrid}>
                    {/* Method Boxes */}
                    <div 
                        onClick={() => setSelectedMethod('card')} 
                        style={{...styles.methodBox, border: selectedMethod === 'card' ? '2px solid blue' : '1px solid gray'}}
                    >
                        Card
                    </div>
                    <div 
                        onClick={() => setSelectedMethod('bank')} 
                        style={{...styles.methodBox, border: selectedMethod === 'bank' ? '2px solid blue' : '1px solid gray'}}
                    >
                        Bank Transfer
                    </div>
                    <div 
                        onClick={() => setSelectedMethod('crypto')} 
                        style={{...styles.methodBox, border: selectedMethod === 'crypto' ? '2px solid blue' : '1px solid gray'}}
                    >
                        Crypto
                    </div>
                </div>
            </div>

            <button onClick={handlePayNow} style={styles.payBtn}>
                Pay Now
            </button>
        </div>
    );
};

export default PaymentMainPage;