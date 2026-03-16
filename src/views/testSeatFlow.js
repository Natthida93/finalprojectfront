import axios from 'axios';
const API_BASE = 'http://localhost:8081/api';
const userEmail = 'kainem@gmail.com'; // your user
const seatIds = [6, "A6"]; // replace with real seat IDs to test
const concertId = 1; // replace with a valid concert ID

async function testSeatFlow() {
  try {
    console.log('--- LOCK SEATS ---');
    for (const seatId of seatIds) {
      try {
        const res = await axios.post(`${API_BASE}/seats/lock`, null, {
          params: { seatId, userEmail }
        });
        console.log(`Seat ${seatId} locked:`, res.data);
      } catch (err) {
        if (err.response && err.response.status === 409) {
          console.log(`Seat ${seatId} already locked by someone else`);
        } else {
          console.error('Lock error:', err.message);
        }
      }
    }

    console.log('--- VALIDATE LOCKS ---');
    const validateRes = await axios.post(`${API_BASE}/seats/validate-locks`, {
      seatIds,
      userEmail
    });
    console.log('Validated seats:', validateRes.data);

    if (!validateRes.data.length) {
      console.log('No seats validated — something is wrong!');
      return;
    }

    console.log('--- RELEASE SEATS ---');
    for (const seat of validateRes.data) {
      await axios.post(`${API_BASE}/seats/release`, null, {
        params: { seatId: seat.id }
      });
      console.log(`Seat ${seat.id} released`);
    }

    console.log('--- TEST COMPLETE ---');
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testSeatFlow();