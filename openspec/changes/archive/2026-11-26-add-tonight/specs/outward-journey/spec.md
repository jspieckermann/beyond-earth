## MODIFIED Requirements

### Requirement: Haptics
On devices that support vibration, the module SHALL give one short pulse when the view snaps into a stage, and no other vibration. Vibration SHALL be switchable off only on the app's settings page („Einstellungen“, switch „Vibration“), and the choice SHALL persist on the device. The module SHALL NOT have its own settings panel; its header leaves room for the app-wide settings gear.

#### Scenario: Pulse on snap
- **WHEN** the view snaps into a stage on a device with vibration on
- **THEN** exactly one short pulse is triggered

#### Scenario: Vibration off in the settings
- **WHEN** the user has switched „Vibration“ off in the settings and the view snaps into a stage
- **THEN** no pulse is triggered
