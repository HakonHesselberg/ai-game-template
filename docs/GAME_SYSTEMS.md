# Game Systems Documentation

> This document describes the core gameplay systems and mechanics. Fill in details specific to your game.

## Overview

[Brief description of your game and its core mechanics]

**Genre:** [Tower Defense, Strategy, Roguelike, etc.]
**Core Loop:** [What the player does repeatedly]
**Win Condition:** [How to win]
**Loss Condition:** [How to lose]

## Game Flow

### Main Loop

```
[Describe your game's main loop]

Example:
1. Build Phase → Player places towers
2. Combat Phase → Enemies spawn and attack
3. Card Selection → Choose upgrades
4. Repeat until win/loss
```

### Turn/Tick Sequence

**[If turn-based or tick-based, describe order of operations]**

Example:
1. **Player Action Phase**
   - Player chooses action (move, attack, ability, etc.)
   - Validate action
   - Apply effects
   - Generate events

2. **Resolution Phase**
   - Process status effects
   - Tick cooldowns
   - Check win/loss conditions

3. **Turn Transition**
   - Switch current player
   - Emit events
   - Start next turn

## Core Systems

### System 1: [e.g., Combat System]

**Purpose:** [What this system does]

**Components:**
- [Component 1] - [Description]
- [Component 2] - [Description]

**How it works:**

[Detailed explanation with formulas]

**Example:**
```
Damage Calculation:
  Base Damage = Attacker.Attack
  Defense Reduction = Defender.Defense
  Final Damage = max(Base Damage - Defense Reduction, 1)

  // Example: 10 attack vs 3 defense = 7 damage
```

**Code Location:**
- Core logic: `/core/systems/combat.{ext}`
- Combat rules: `/core/rules/combat_rules.{ext}`
- Tests: `/tests/unit/test_combat.{ext}`

**Events Generated:**
- `DamageEvent` - When damage is dealt
- `DeathEvent` - When entity dies
- `AttackEvent` - When attack is initiated

### System 2: [e.g., Progression System]

**Purpose:** [What this system does]

**Components:**
- [Component 1] - [Description]
- [Component 2] - [Description]

**How it works:**

[Detailed explanation with formulas]

**Example:**
```
Experience and Leveling:
  XP Required = 10 * Level^2
  Level 1→2: 10 XP
  Level 2→3: 40 XP
  Level 3→4: 90 XP

  Max Level: 10
```

**Code Location:**
- [Relevant file paths]

### System 3: [e.g., Resource System]

**Purpose:** [What this system does]

**Resources:**
- **[Resource 1]** - [How earned, how spent, max amount]
- **[Resource 2]** - [How earned, how spent, max amount]

**Formulas:**
```
[Resource generation formulas]
[Resource cost formulas]
```

## Status Effects

### Buff/Debuff System

**Effect Types:**

**Buffs (Positive):**
- **[Effect Name]** - [Description, duration, stack rules]
  - Formula: [How it modifies stats]
  - Example: "Haste: +50% attack speed for 10 seconds"

**Debuffs (Negative):**
- **[Effect Name]** - [Description, duration, stack rules]
  - Formula: [How it modifies stats]
  - Example: "Poison: -5 HP per second for 5 seconds"

**Stacking Rules:**
- **Additive:** Multiple stacks add together (2x Poison = -10 HP/sec)
- **Multiplicative:** Multiple stacks multiply (2x Damage Boost = 2.25x)
- **Duration Refresh:** New application resets duration
- **No Stacking:** Only one instance active

**Code Location:**
- Status definitions: `/core/effects/status_effects.{ext}`
- Status processor: `/application/processors/status_processor.{ext}`

## Abilities System

> If your game has abilities/skills

**Ability Structure:**
```
Ability {
  id: unique identifier
  name: display name
  description: what it does
  cooldown: seconds between uses
  charges: max charges (if applicable)
  cost: resource cost (if applicable)
  target: targeting rules
  effects: list of effects to apply
}
```

**Targeting Types:**
- **Self:** Casts on caster
- **Single Target:** Choose one enemy/ally
- **Area of Effect (AOE):** Affects radius around point
- **Line:** Affects entities in line
- **Global:** Affects all entities matching condition

**Example Ability:**
```
Fireball {
  id: "fireball"
  name: "Fireball"
  description: "Deal 50 damage in 3-tile radius"
  cooldown: 5 seconds
  target: AOE (radius: 3)
  effects: [
    DamageEffect(amount: 50),
    BurningEffect(duration: 3s, dps: 10)
  ]
}
```

**Code Location:**
- Ability definitions: `/data/abilities/`
- Ability processor: `/application/processors/ability_processor.{ext}`
- Effect handlers: `/core/effects/handlers/`

## Balance Values

### Core Balance Constants

```
# Damage and Combat
BASE_DAMAGE = 10
CRIT_CHANCE = 0.15      # 15%
CRIT_MULTIPLIER = 2.0   # 200% damage

# Resources
STARTING_GOLD = 100
GOLD_PER_KILL = 10

# Progression
XP_PER_LEVEL = lambda level: 10 * level^2
MAX_LEVEL = 10

# Timing
ATTACK_SPEED_BASE = 1.0  # Attacks per second
COOLDOWN_REDUCTION_CAP = 0.4  # 40% max CDR
```

**File Location:** `/data/balance.config` or `/core/balance/constants.{ext}`

### Difficulty Scaling

**How difficulty increases over time:**

```
Wave/Level Scaling:
  Enemy HP = Base HP * (1 + 0.1 * Wave)
  Enemy Damage = Base Damage * (1 + 0.05 * Wave)
  Enemy Count = Base Count * Wave^1.2

Example Wave 10:
  HP: 100 * (1 + 0.1 * 10) = 200 HP
  Damage: 10 * (1 + 0.05 * 10) = 15 damage
  Count: 5 * 10^1.2 = ~79 enemies
```

## Entity Types

### [Entity Category 1: e.g., Enemies]

**Entity Type: [e.g., Goblin]**
- **HP:** [Value]
- **Damage:** [Value]
- **Speed:** [Value]
- **Special:** [Unique mechanics]
- **Worth:** [XP/Gold reward]

**Entity Type: [e.g., Orc]**
- **HP:** [Value]
- **Damage:** [Value]
- **Speed:** [Value]
- **Special:** [Unique mechanics]
- **Worth:** [XP/Gold reward]

### [Entity Category 2: e.g., Towers]

**Entity Type: [e.g., Basic Tower]**
- **Damage:** [Value]
- **Range:** [Value]
- **Attack Speed:** [Value]
- **Cost:** [Value]
- **Special:** [Unique mechanics]

## Events System

**Event Flow:**
```
Game Logic → Generates Events → Event Bus → UI/Audio/Effects
```

**Core Events:**

- **`EntitySpawnedEvent`**
  - Data: entity, position
  - Triggers: Visual spawn animation

- **`DamageEvent`**
  - Data: source, target, amount, type
  - Triggers: Damage number, hit animation

- **`DeathEvent`**
  - Data: entity, killer, position
  - Triggers: Death animation, reward grant

- **`AbilityUsedEvent`**
  - Data: caster, ability, targets
  - Triggers: Visual effects, sound

**Adding New Events:**
1. Define event class in `/core/events/`
2. Emit from game logic
3. Subscribe in presentation layer
4. Handle in UI/audio/effects

## Data Formats

### Entity Definition Format

**JSON Example:**
```json
{
  "id": "goblin_scout",
  "name": "Goblin Scout",
  "type": "enemy",
  "stats": {
    "health": 50,
    "damage": 5,
    "speed": 3.0,
    "armor": 0
  },
  "abilities": [],
  "rewards": {
    "xp": 10,
    "gold": 5
  }
}
```

### Ability Definition Format

**JSON Example:**
```json
{
  "id": "fireball",
  "name": "Fireball",
  "description": "Launch a fireball dealing 50 damage",
  "cooldown": 5.0,
  "targeting": {
    "type": "aoe",
    "radius": 3.0,
    "max_targets": 10
  },
  "effects": [
    {
      "type": "damage",
      "amount": 50
    },
    {
      "type": "status",
      "status_id": "burning",
      "duration": 3.0
    }
  ]
}
```

## Formulas Reference

### Quick Formula List

```
# Damage
Final Damage = max(Attack - Defense, 1)

# Critical Hit
Is Crit = Random() < Crit Chance
Crit Damage = Base Damage * Crit Multiplier

# Attack Speed
Attacks Per Second = Base Speed * (1 + Speed Bonus)
Time Between Attacks = 1 / Attacks Per Second

# Range
In Range = Distance(A, B) <= Range
Distance = sqrt((x2-x1)^2 + (y2-y1)^2)

# Status Effect Stacking (Additive)
Total Effect = Base Effect * Stack Count

# Status Effect Stacking (Multiplicative)
Total Effect = 1 - (1 - Base Effect)^Stack Count

# Experience/Leveling
XP for Level N = 10 * N^2
Total XP for Level N = sum(XP for each level up to N)
```

## Testing Guidelines

### Balance Testing Targets

**For combat balance:**
- Time to kill (TTK) for basic enemy: 2-3 seconds
- Player should clear wave in 30-60 seconds
- Boss fight duration: 2-5 minutes

**For difficulty:**
- Wave 1 win rate: 95%+
- Wave 10 win rate: 70-80%
- Wave 20 win rate: 50-70%
- Final wave win rate: 10-30%

**For economy:**
- Can afford upgrade every 2-3 waves
- Not enough gold to buy everything (force choices)

### Automated Testing

See TESTING.md for detailed testing strategies.

**Headless simulation tests:**
- Same seed produces same results
- Win rate within target ranges
- Performance under load (1000+ entities)

## Future Systems

> Placeholder for planned features

- [ ] [System Name] - [Brief description]
- [ ] [System Name] - [Brief description]

---

## Quick Reference

**Key Files:**
- Balance: `/data/balance.config`
- Entity Definitions: `/data/entities/`
- Ability Definitions: `/data/abilities/`
- Core Systems: `/core/systems/`
- Processors: `/application/processors/`

**Key Constants:**
- [Constant] = [Value]
- [Constant] = [Value]

**Core Formulas:**
- [Formula name]: [Formula]
