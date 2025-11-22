# Common Pitfalls to Avoid

Based on project history, these issues appear repeatedly. **Check before committing:**

## 1. Hard-Coded Values / Magic Numbers ⚠️ CRITICAL

**Problem:** Numeric literals scattered throughout code make it hard to maintain and understand intent.

```python
# ❌ BAD - What do these numbers mean?
if damage > 100:
    color = (255, 50, 50)
spawn_enemy(x + 10, y + 5)
particle_count = 15
```

```python
# ✅ GOOD - Clear intent, easy to tune
CRITICAL_DAMAGE_THRESHOLD = 100
COLOR_CRITICAL_DAMAGE = (255, 50, 50)  # Bright red
SPAWN_OFFSET_X = 10  # Padding from entity center
SPAWN_OFFSET_Y = 5   # Ground level offset
PARTICLE_COUNT_EXPLOSION = 15

if damage > CRITICAL_DAMAGE_THRESHOLD:
    color = COLOR_CRITICAL_DAMAGE
spawn_enemy(x + SPAWN_OFFSET_X, y + SPAWN_OFFSET_Y)
```

**Where to extract constants:**
- Balance values → `/data/balance.config` or balance constants file
- Visual constants → `visual_constants` or `presentation/constants` file
- Component-specific → Top of the component file with comment
- Formulas → Document in comments: `DAMAGE_MULTIPLIER = 1.5  # 50% bonus`

**How to identify:**
- Any number that isn't 0, 1, -1
- Any number that appears more than once
- Any number that might need tuning
- Any calculation with unexplained coefficients

## 2. Missing Type Hints/Annotations ⚠️ ENFORCED

**Problem:** Missing types cause maintainability issues and prevent type checkers from finding bugs.

```python
# ❌ BAD - No type information
def calculate(x, y):
    return x + y

def get_entity(id):
    return self.entities.get(id)
```

```python
# ✅ GOOD - Full type coverage
def calculate(x: float, y: float) -> float:
    return x + y

def get_entity(entity_id: str) -> Optional[Entity]:
    return self.entities.get(entity_id)
```

**Required for:**
- All function parameters
- All function return types
- Class attributes (when not obvious from init)
- Module-level variables
- Generic types (List[Entity], Dict[str, int])

**Run type checker before commit:**
```bash
mypy src/          # Python
tsc --noEmit       # TypeScript
dotnet build       # C#
```

## 3. Missing Imports ⚠️ FREQUENT

**Problem:** Using constants/types without importing causes runtime crashes.

```python
# ❌ BAD - Where does SPAWN_RATE come from?
def spawn_enemies():
    if random.random() < SPAWN_RATE:  # NameError!
        create_enemy()
```

```python
# ✅ GOOD - Explicit imports
from game.constants import SPAWN_RATE
from game.entities import Enemy

def spawn_enemies():
    if random.random() < SPAWN_RATE:
        create_enemy()
```

**Always:**
- Use explicit imports, never wildcards (`from module import *`)
- Group imports: stdlib → third-party → local
- Sort imports (many tools can automate this)
- Actually run the code to verify imports work

**Common mistake:**
```python
# ❌ BAD - Wildcard import
from constants import *

# ✅ GOOD - Explicit import
from constants import (
    SPAWN_RATE,
    MAX_ENEMIES,
    DIFFICULTY_MULTIPLIER,
)
```

## 4. Null/None/Undefined Handling ⚠️ MODERATE

**Problem:** Not checking for null/none before accessing properties.

```python
# ❌ BAD - Crashes if target is None
def render_attack_line(tower):
    target_pos = tower.target.position  # AttributeError if target is None!
    draw_line(tower.position, target_pos)
```

```python
# ✅ GOOD - Defensive programming
def render_attack_line(tower):
    if tower.target is None:
        return
    target_pos = tower.target.position
    draw_line(tower.position, target_pos)
```

**Common cases:**
- `target` can be None (no valid target)
- List access `[0]` when list might be empty
- Dictionary access without `.get()` or `in` check
- Optional parameters without default values
- Return values that might be None

**Better patterns:**
```python
# Option 1: Early return
if entity is None:
    return

# Option 2: Default value
damage = entity.damage if entity else 0

# Option 3: Optional chaining (some languages)
position = entity?.target?.position  # Returns None if any is None
```

## 5. Tests Breaking After API Changes ⚠️ FREQUENT

**Problem:** Changing APIs without updating tests causes CI failures.

**When you modify:**
- Function signatures → Update all tests using that function
- Return types → Update assertions in tests
- Class APIs → Update test fixtures and mocks
- Add parameters → Update all call sites in tests

**Always run tests after API changes:**
```bash
<test-command>  # pytest, npm test, dotnet test, etc.
```

**Example:**
```python
# Changed API
def calculate_damage(attacker, defender, modifier=1.0):  # Added modifier
    ...

# ❌ BAD - Old tests still call without modifier
def test_calculate_damage():
    result = calculate_damage(attacker, defender)  # Works but doesn't test new param

# ✅ GOOD - Update tests
def test_calculate_damage_with_default_modifier():
    result = calculate_damage(attacker, defender)
    assert result == expected_base_damage

def test_calculate_damage_with_custom_modifier():
    result = calculate_damage(attacker, defender, modifier=2.0)
    assert result == expected_base_damage * 2.0
```

## 6. Layer Violations ⚠️ CRITICAL

**Problem:** Core importing Presentation breaks architecture and testability.

```python
# ❌ BAD - Core importing Presentation
# In /core/entity.py
from presentation.renderer import render_sprite  # NO!

class Entity:
    def update(self):
        render_sprite(self.sprite)  # Core should not render!
```

```python
# ✅ GOOD - Presentation imports Core
# In /presentation/entity_renderer.py
from core.entity import Entity

class EntityRenderer:
    def render(self, entity: Entity):
        render_sprite(entity.sprite)
```

**Rule:** Dependencies flow downward only
```
Presentation → Application → Core → Data
```

**Violations to watch for:**
- Core importing anything from Presentation
- Core importing anything from Application
- Application importing from Presentation
- Using UI types in Core (Color, Sprite, etc.)

## 7. Code Duplication ⚠️ MODERATE

**Problem:** Copy-pasting code instead of extracting shared logic.

```python
# ❌ BAD - Duplicate logic
def render_health_bar(enemy):
    width = 40
    height = 4
    fill_ratio = enemy.health / enemy.max_health
    color = interpolate_color(GREEN, RED, 1 - fill_ratio)
    # ... 15 lines of gradient drawing ...

def render_progress_bar(value):
    width = 100
    height = 6
    fill_ratio = value
    color = interpolate_color(BLUE, WHITE, 1 - fill_ratio)
    # ... same 15 lines of gradient drawing ...
```

```python
# ✅ GOOD - Extract shared logic
def _draw_gradient_bar(rect, fill_ratio, color_start, color_end):
    """Draw gradient-filled bar (shared implementation)"""
    # ... 15 lines of gradient drawing (once)
    ...

def render_health_bar(enemy):
    rect = Rect(x, y, width=40, height=4)
    fill_ratio = enemy.health / enemy.max_health
    _draw_gradient_bar(rect, fill_ratio, GREEN, RED)

def render_progress_bar(value):
    rect = Rect(x, y, width=100, height=6)
    _draw_gradient_bar(rect, value, BLUE, WHITE)
```

**Before copying code:**
- Can this be a shared function?
- Can this be a shared constant?
- Is there already a similar function?
- Should this be a utility class?

## 8. Non-Deterministic Operations ⚠️ CRITICAL

**Problem:** Using random() or Date.now() breaks determinism and testability.

```python
# ❌ BAD - Non-deterministic
import random

def spawn_enemy():
    if random.random() < 0.5:  # Different every run!
        create_boss()
```

```python
# ✅ GOOD - Deterministic with seeded RNG
def spawn_enemy(rng):
    if rng.random() < 0.5:  # Same for same seed
        create_boss()

# Usage
game = Game(seed=12345)
spawn_enemy(game.rng)  # Always use game's RNG
```

**Always:**
- Use seeded RNG from game state
- Never use `Math.random()`, `random.random()`, etc.
- Never use `Date.now()` or system time for gameplay
- Use fixed timestep, not wall clock time

**For testing:**
```python
def test_spawn_with_seed_is_deterministic():
    results = []
    for _ in range(10):
        game = Game(seed=12345)
        result = game.spawn_wave()
        results.append(result)

    # All results should be identical
    assert all(r == results[0] for r in results)
```

## 9. Mutable Default Arguments ⚠️ MODERATE (Python-specific)

**Problem:** Mutable defaults are shared between calls.

```python
# ❌ BAD - List is shared!
def add_enemy(enemies=[]):
    enemies.append(create_enemy())
    return enemies

# First call
list1 = add_enemy()  # [Enemy1]
# Second call
list2 = add_enemy()  # [Enemy1, Enemy2] - UNEXPECTED!
```

```python
# ✅ GOOD - Create new list each time
def add_enemy(enemies=None):
    if enemies is None:
        enemies = []
    enemies.append(create_enemy())
    return enemies
```

**Never use mutable defaults:**
- Lists: `[]`
- Dictionaries: `{}`
- Sets: `set()`
- Custom objects

**Safe defaults:**
- `None` (then create inside function)
- Immutable types: `0`, `""`, `()`, `True`

## 10. Breaking Immutability ⚠️ HIGH

**Problem:** Mutating state instead of creating new instances.

```python
# ❌ BAD - Mutating state
def take_damage(entity, amount):
    entity.health -= amount  # Modifies original!
    return entity
```

```python
# ✅ GOOD - Creating new instance
def take_damage(entity, amount):
    return entity.with_health(entity.health - amount)  # New instance

# Or using dataclass replace
from dataclasses import replace

def take_damage(entity, amount):
    return replace(entity, health=entity.health - amount)
```

**Benefits of immutability:**
- Easy to test (no hidden state changes)
- Can undo/replay (keep old states)
- Supports AI simulation (clone state)
- Prevents bugs (no unexpected mutations)

**Patterns for immutability:**
```python
# Pattern 1: Return new instance
class Entity:
    def take_damage(self, amount):
        return Entity(health=self.health - amount, ...)

# Pattern 2: With methods
class Entity:
    def with_health(self, new_health):
        return replace(self, health=new_health)

# Pattern 3: Functional update
new_entity = update_entity(old_entity, health=new_health)
```

## 11. Forgetting to Register New Content ⚠️ HIGH

**Problem:** Creating new entity/ability/component but not registering it.

```python
# ❌ BAD - Created but not registered
# In components/fire_component.py
class FireComponent(Component):
    component_id = "fire"
    component_name = "Fire"
    ...

# Forgot to add to registry!
```

```python
# ✅ GOOD - Register in registry
# In data/component_registry.py
from components.fire_component import FireComponent

COMPONENT_CLASSES = {
    "fire": FireComponent,
    "ice": IceComponent,
    # ... all components
}
```

**Checklist when adding content:**
- [ ] Create the class/definition
- [ ] Add to appropriate registry
- [ ] Add tests for the new content
- [ ] Verify it loads correctly
- [ ] Test it in-game

## 12. Not Cleaning Up Resources ⚠️ LOW

**Problem:** Creating resources without disposing them.

```python
# ❌ BAD - File not closed on exception
def load_data():
    file = open("data.json")
    data = json.load(file)
    file.close()  # Not called if exception!
    return data
```

```python
# ✅ GOOD - Use context manager
def load_data():
    with open("data.json") as file:
        data = json.load(file)
    return data  # File closed automatically
```

**Use context managers for:**
- Files
- Network connections
- Database connections
- Locks/semaphores
- Any resource that needs cleanup

## Pre-Commit Checklist

Before every commit, verify:

- [ ] No hard-coded magic numbers (extract to constants)
- [ ] All imports present and explicit (no wildcards)
- [ ] Full type hints on all functions
- [ ] Defensive null/none checking where needed
- [ ] Tests updated for API changes
- [ ] No obvious code duplication
- [ ] No layer violations (Core importing Presentation)
- [ ] Using seeded RNG, not random()
- [ ] No mutable default arguments
- [ ] Maintaining immutability
- [ ] New content registered
- [ ] Run `<type-check-command>` successfully
- [ ] Run `<test-command>` successfully

## Quick Checks via Grep

```bash
# Find magic numbers (numbers that aren't 0, 1, -1)
grep -rn '[^0-9][2-9][0-9]*' src/

# Find non-seeded random usage
grep -rn 'Math.random\|random.random' src/

# Find wildcard imports
grep -rn 'import \*' src/

# Find layer violations
grep -rn 'from presentation' core/
grep -rn 'from application' core/

# Find mutable defaults (Python)
grep -rn 'def.*=\[\]' src/
grep -rn 'def.*={}' src/
```

## Language-Specific Pitfalls

### Python
- Mutable default arguments
- Missing `__init__.py` in packages
- Circular imports
- Global statement in functions

### JavaScript/TypeScript
- `==` instead of `===`
- Forgetting `async/await`
- Not handling Promise rejections
- `this` binding issues

### C#
- Not disposing IDisposable
- Blocking on async code
- Reference vs value types confusion
- Forgetting `using` statements

---

## How to Use This Document

1. **Before starting work**: Skim relevant sections
2. **During development**: Reference when unsure
3. **Before committing**: Use as checklist
4. **After finding bugs**: Add new pitfalls here
5. **Share with team**: Keep this as living document

**Remember:** This document grows with the project. Add new pitfalls as you discover them!
