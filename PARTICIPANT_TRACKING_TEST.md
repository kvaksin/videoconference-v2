# Participant Tracking Test Guide

## 🎯 **Participant Counter Implementation**

### ✅ **What Was Fixed:**

#### **1. Backend Participant Tracking**
- Added `roomParticipants` Map to track users in each room
- Enhanced `join-room` event to add participants and emit `participants-updated`
- Enhanced `leave-room` event to remove participants and emit `participants-updated`
- Added proper guest tracking in `guest-joined` and `guest-left` events
- Added cleanup on disconnect

#### **2. Frontend Participant Display**
- **MeetingPage**: Added participant counter in header
- **GuestMeetingPage**: Already had participant display (was working correctly)
- Both pages now listen for `participants-updated` events

#### **3. Unified Room Management**
- Guests and authenticated users now join the same `roomId`
- Participant list includes both user types with `isGuest` flag
- Real-time updates when anyone joins/leaves

### 🧪 **Testing Steps:**

#### **Test 1: Single User Meeting**
1. **Login** → Dashboard
2. **Click "🚀 Start Meeting Now"**
3. **Expected**: Header shows "👥 1 participant"
4. **Check**: Status shows 🟢 LIVE

#### **Test 2: Guest Joining**
1. **From authenticated meeting**, click "👥 Guest Link"
2. **Open incognito window**, paste guest link
3. **Enter guest name** and join
4. **Expected**: 
   - Authenticated user sees "👥 2 participants"
   - Guest user sees "Participants (2)" in sidebar
   - Both see each other in participant lists

#### **Test 3: Multiple Participants**
1. **Open additional browser windows** (or incognito tabs)
2. **Join same meeting** via guest links
3. **Expected**: Participant counter increases for each new user
4. **Leave meeting** → Counter decreases

#### **Test 4: Real-time Updates**
1. **Have multiple users in meeting**
2. **One user leaves** (close browser tab)
3. **Expected**: Participant count updates immediately for remaining users

### 🔍 **Debugging Information:**

#### **Terminal Logs to Watch For:**
```
User [userId] joined room [roomId]
Guest [guestName] joined meeting [roomId]
[Participants updated event emitted]
```

#### **Browser Console Logs:**
```javascript
// In MeetingPage console
"Participants updated: [{id: 'user123', name: 'User', isGuest: false}, {id: 'guest-123', name: 'Guest User', isGuest: true}]"

// In GuestMeetingPage console  
"Guest joining room: [roomId] with guest info: {name: 'Test Guest'}"
```

#### **Check Network Tab:**
- WebSocket connection established
- Socket events being sent/received
- No 404 errors on meeting API calls

### 📊 **Expected Results:**

#### **MeetingPage Header:**
- Shows status badge: 🟢 LIVE
- Shows participant count: 👥 X participants
- Updates in real-time as users join/leave

#### **GuestMeetingPage Sidebar:**
- Shows "Participants (X)" section
- Lists current user + guest badge
- Lists other participants with type indicators
- Updates in real-time

#### **Terminal Output:**
```
User 51df1cbe-c575-4ae2-93a7-b10132207255 joined room 17ac0331-aedb-45ae-b8dd-5516d19161f2
Guest Test Guest joined meeting 17ac0331-aedb-45ae-b8dd-5516d19161f2
```

### 🐛 **If Still Showing 0 Participants:**

#### **Check These Issues:**

1. **Backend Events Not Firing:**
   ```bash
   # Check terminal for join/leave events
   # Should see: "User X joined room Y"
   ```

2. **Frontend Not Listening:**
   ```javascript
   // In browser console, check if socket connected
   // Network tab should show WebSocket connection
   ```

3. **Room ID Mismatch:**
   ```javascript
   // Check console logs for room IDs
   // Guest and authenticated users should join same roomId
   ```

4. **Cache Issues:**
   ```bash
   # Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
   # Check if participants array is being updated
   ```

### 🚀 **Quick Test Commands:**

#### **Browser Console Test:**
```javascript
// Check if participants array is updating
console.log('Current participants:', participants);

// Manually trigger refresh (if participants state is exposed)
// This would be in React DevTools
```

#### **Manual Verification:**
1. **Open React DevTools**
2. **Find MeetingPage or GuestMeetingPage component**
3. **Check `participants` state** - should be array with participant objects
4. **Watch state update** as users join/leave

### 📈 **Success Criteria:**

- ✅ Participant counter starts at 1 when first user joins
- ✅ Counter increments when guests join
- ✅ Counter decrements when users leave  
- ✅ Real-time updates without page refresh
- ✅ Both authenticated and guest users see same counts
- ✅ Participant list shows correct names and types

### 🎯 **Testing Sequence:**

1. **Start fresh meeting** → Count = 1
2. **Guest joins** → Count = 2
3. **Another guest joins** → Count = 3
4. **First guest leaves** → Count = 2
5. **All guests leave** → Count = 1
6. **Host leaves** → Meeting ends

If you're still seeing 0 participants after these fixes, the issue is likely:
- Socket connection not established
- Events not being received
- State not updating properly
- Room ID mismatch between users

Check the browser console and terminal logs for specific error messages!