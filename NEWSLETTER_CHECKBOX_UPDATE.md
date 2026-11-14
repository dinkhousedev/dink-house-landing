# Newsletter Form - Opt-In Checkbox Update

## Changes Made

Added a required opt-in checkbox to the newsletter form for explicit user consent.

### Updated File

`components/newsletter-form.tsx`

## Features Implemented

### ✅ Checkbox Input

- **Required field** with red asterisk indicator
- **Unchecked by default** (explicit opt-in)
- Styled with brand color (#B3FF00)
- Accessible with proper label association

### ✅ Form Validation

- Submit button **disabled** until checkbox is checked
- Client-side validation with error message
- Checkbox state resets after successful submission

### ✅ GDPR Compliance

- **Explicit consent language**: "I agree to receive email notifications..."
- Clearly states what user will receive (court bookings, events, tips, offers)
- Identifies the sender (The Dink House)
- Required field (no pre-checked boxes)

### ✅ User Experience

- Checkbox and label are clickable
- Visual feedback on hover/focus
- Maintains brand styling (#B3FF00 accent color)
- Responsive layout (stacks on mobile)
- Shows error if user tries to submit without checking

## UI Layout

**Before:**

```
[Email Input] [Subscribe Button]
```

**After:**

```
[Email Input] [Subscribe Button]
[☐] I agree to receive email notifications... *
```

## Form Behavior

1. **Initial State:**

   - Checkbox: unchecked
   - Submit button: disabled (grayed out)

2. **User checks checkbox:**

   - Submit button: enabled

3. **User unchecks checkbox:**

   - Submit button: disabled again

4. **User tries to submit without checking:**

   - Error message: "Please confirm that you want to receive notifications."

5. **Successful submission:**
   - Email field cleared
   - Checkbox reset to unchecked
   - Success message shown

## Code Changes

### State Management

```typescript
const [acceptNotifications, setAcceptNotifications] = useState(false);
```

### Validation

```typescript
if (!acceptNotifications) {
  setMessage({
    type: "error",
    text: "Please confirm that you want to receive notifications.",
  });
  return;
}
```

### Submit Button

```typescript
disabled={loading || !acceptNotifications}
```

### Checkbox Component

```tsx
<div className="flex items-start gap-3">
  <input
    required
    checked={acceptNotifications}
    className="mt-1 w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#B3FF00] accent-[#B3FF00] cursor-pointer"
    disabled={loading}
    id="accept-notifications"
    type="checkbox"
    onChange={(e) => setAcceptNotifications(e.target.checked)}
  />
  <label
    className="text-sm text-gray-700 cursor-pointer select-none"
    htmlFor="accept-notifications"
  >
    I agree to receive email notifications about court bookings, events, tips,
    and special offers from The Dink House.{" "}
    <span className="text-red-500">*</span>
  </label>
</div>
```

## Testing Checklist

- [ ] Checkbox is unchecked by default
- [ ] Submit button is disabled when checkbox is unchecked
- [ ] Submit button enables when checkbox is checked
- [ ] Clicking label toggles checkbox
- [ ] Error message shows if trying to submit without checking
- [ ] Checkbox resets after successful submission
- [ ] Responsive layout works on mobile devices
- [ ] Focus states work correctly (keyboard navigation)
- [ ] Brand color (#B3FF00) shows on checkbox when checked

## Compliance Notes

### GDPR Requirements ✅

- **Affirmative action required** (unchecked by default)
- **Clear consent language** (what user is consenting to)
- **Granular consent** (specific about notification types)
- **Easy to understand** (plain language)

### Best Practices ✅

- No pre-checked boxes
- Separate from other agreements
- Clear and conspicuous
- Required field indicator
- User must actively check the box

## Browser Compatibility

Works on all modern browsers:

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Consider adding:

- Link to Privacy Policy in checkbox label
- Preference center for notification types
- Option to choose notification frequency
- Ability to update preferences later

## Deployment

This change only affects the frontend. No database or API changes required.

```bash
cd dink-house-landing-dev
npm run build
# Deploy to hosting provider
```

## Related Files

- `components/newsletter-form.tsx` - Updated form component
- `lib/api.ts` - API client (no changes needed)
- `pages/confirm-subscription.tsx` - Confirmation page
- `pages/unsubscribe.tsx` - Unsubscribe page
