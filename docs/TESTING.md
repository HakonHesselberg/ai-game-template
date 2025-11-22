# Testing Standards

## Test Naming Convention

All tests MUST follow: `Method_Condition_Behavior`

**Format:** `MethodName_SpecificCondition_ExpectedOutcome`

- **Method**: The action/method being tested (FIRST)
- **Condition**: The specific scenario or input (MIDDLE)
- **Behavior**: The expected result (LAST)

**Examples:**
```
test("ApplyDamage_WithZeroHealth_ReturnsFalse")
test("GetPosition_WhenUnplaced_ReturnsNull")
test("Validate_WithValidInput_ReturnsTrue")
test("Calculate_WithNegativeValue_ThrowsException")
test("GetEntities_WhenEmpty_ReturnsEmptyList")
```

### Common Condition Patterns

| Pattern | Usage | Example |
|---------|-------|---------|
| `WhenCalled` | Simple invocation | `GetState_WhenCalled_ReturnsCurrentState` |
| `WithValidInput` | Valid scenario | `Validate_WithValidTarget_ReturnsTrue` |
| `WithNullInput` | Null parameter | `Calculate_WithNullTarget_ThrowsException` |
| `WithZeroValue` | Zero/empty | `Divide_WithZeroDivisor_ThrowsException` |
| `WhenEmpty` | Empty state | `GetEntities_WhenEmpty_ReturnsEmptyList` |
| `AfterOperation` | Post-condition | `GetCount_AfterAddingItem_ReturnsOne` |

### Common Behavior Patterns

| Pattern | Usage | Example |
|---------|-------|---------|
| `Returns[X]` | Returns value | `Calculate_WithZero_ReturnsZero` |
| `Throws[X]` | Throws exception | `Execute_WithNull_ThrowsArgumentException` |
| `[Action]s[Target]` | Performs action | `Execute_WithValidTarget_AppliesDamage` |
| `Creates[X]` | Creates object | `Factory_WithValidData_CreatesInstance` |
| `Updates[X]` | Modifies property | `SetLevel_WithTwo_UpdatesLevel` |

## Test Structure (Arrange-Act-Assert)

Use the AAA pattern for all tests:

### Python Example
```python
def test_take_damage_with_lethal_damage_kills_entity():
    # Arrange: Set up test data
    entity = create_test_entity(health=10)
    lethal_damage = 10

    # Act: Execute the operation
    result = entity.take_damage(lethal_damage)

    # Assert: Verify expected outcome
    assert not result.is_alive
    assert result.health == 0
```

### C# Example
```csharp
[Test]
public void TakeDamage_WithLethalDamage_KillsEntity()
{
    // Arrange
    var entity = CreateTestEntity(health: 10);
    const int LethalDamage = 10;

    // Act
    var result = entity.TakeDamage(LethalDamage);

    // Assert
    Assert.That(result.IsAlive, Is.False);
    Assert.That(result.Health, Is.EqualTo(0));
}
```

### JavaScript/TypeScript Example
```typescript
test('takeDamage_withLethalDamage_killsEntity', () => {
    // Arrange
    const entity = createTestEntity({ health: 10 });
    const lethalDamage = 10;

    // Act
    const result = entity.takeDamage(lethalDamage);

    // Assert
    expect(result.isAlive).toBe(false);
    expect(result.health).toBe(0);
});
```

## Test-Driven Development Cycle

### The Red-Green-Refactor Loop

1. **RED**: Write a failing test first
   - Think about the API you want
   - Write test for desired behavior
   - Run test and watch it fail
   - Confirms test is actually testing something

2. **GREEN**: Write minimal code to pass
   - Implement simplest solution
   - Get test to pass
   - Don't worry about elegance yet
   - Just make it work

3. **REFACTOR**: Clean up while keeping tests green
   - Improve code structure
   - Remove duplication
   - Improve naming
   - Keep all tests passing

4. **REPEAT**: Continue for next feature
   - Build incrementally
   - Always have working code
   - Confidence through tests

### TDD Rules

- ❌ **Never** write production code without a test first
- ✅ **Always** run tests after every change
- ✅ **Fix** failing tests immediately (don't accumulate failures)
- ✅ **Maintain** 100% pass rate before commits
- ✅ **Write** one test at a time
- ✅ **Keep** tests fast (milliseconds, not seconds)

## Test Categories

Organize tests by purpose and speed:

### Unit Tests
- **Purpose**: Test individual functions/classes in isolation
- **Speed**: Milliseconds per test
- **Scope**: Single function or method
- **Dependencies**: None (use mocks/stubs)
- **Example**: Test damage calculation formula

### Integration Tests
- **Purpose**: Test interaction between components
- **Speed**: Seconds per test
- **Scope**: Multiple systems working together
- **Dependencies**: Real dependencies
- **Example**: Test full combat sequence

### Performance Tests
- **Purpose**: Validate performance characteristics
- **Speed**: Varies
- **Scope**: Critical paths with realistic data
- **Dependencies**: Real data at scale
- **Example**: 1000 entities update in < 16ms

### Balance Tests (Game-Specific)
- **Purpose**: Validate game difficulty and balance
- **Speed**: Seconds to minutes
- **Scope**: Full game simulations
- **Dependencies**: Headless game mode
- **Example**: Win rate should be 50-70%

## Test Organization

### File Structure
```
/tests/
  /unit/
    test_entity.py
    test_damage_calculator.py
  /integration/
    test_combat_system.py
    test_game_loop.py
  /performance/
    test_entity_update_performance.py
  /manual/
    test_basic_gameplay.py
    test_balance_validation.py
```

### Test Class Organization
```
class TestEntity:
    """Tests for Entity class"""

    # Group related tests
    class TestTakeDamage:
        def test_with_normal_damage_reduces_health(self): ...
        def test_with_lethal_damage_kills_entity(self): ...
        def test_with_zero_damage_does_nothing(self): ...

    class TestApplyStatus:
        def test_with_new_status_adds_to_list(self): ...
        def test_with_existing_status_updates_stacks(self): ...
```

## Assertions

Use clear, expressive assertions:

### Python (pytest)
```python
# Values
assert actual == expected
assert actual != unexpected

# Nullability
assert value is None
assert value is not None

# Booleans
assert condition is True
assert condition is False

# Collections
assert len(list) == 5
assert item in list
assert list == []

# Exceptions
with pytest.raises(ValueError):
    function_that_raises()
```

### C# (NUnit)
```csharp
// Values
Assert.That(actual, Is.EqualTo(expected));
Assert.That(actual, Is.Not.EqualTo(unexpected));

// Nullability
Assert.That(obj, Is.Null);
Assert.That(obj, Is.Not.Null);

// Booleans
Assert.That(condition, Is.True);
Assert.That(condition, Is.False);

// Collections
Assert.That(list, Has.Count.EqualTo(5));
Assert.That(list, Contains.Item(item));
Assert.That(list, Is.Empty);

// Exceptions
Assert.Throws<ArgumentNullException>(() => method(null));
```

### JavaScript (Jest/Vitest)
```javascript
// Values
expect(actual).toBe(expected);
expect(actual).not.toBe(unexpected);

// Nullability
expect(value).toBeNull();
expect(value).not.toBeNull();

// Booleans
expect(condition).toBe(true);
expect(condition).toBe(false);

// Collections
expect(list).toHaveLength(5);
expect(list).toContain(item);
expect(list).toEqual([]);

// Exceptions
expect(() => functionThatThrows()).toThrow(Error);
```

## Testing Immutability

Verify that functions don't mutate input:

```python
def test_take_damage_when_called_returns_new_instance():
    # Arrange
    original = create_entity(health=10)

    # Act
    modified = original.take_damage(5)

    # Assert
    assert modified is not original  # Different instance
    assert original.health == 10     # Original unchanged
    assert modified.health == 5      # New instance changed
```

## Testing Determinism

Verify same seed produces same results:

```python
def test_combat_with_same_seed_produces_same_result():
    # Arrange
    seed = 12345

    # Act
    result1 = simulate_combat(seed)
    result2 = simulate_combat(seed)

    # Assert
    assert result1.winner == result2.winner
    assert result1.final_hp == result2.final_hp
    assert result1.damage_log == result2.damage_log
```

## Testing Events

Verify correct events are generated:

```python
def test_apply_damage_with_valid_damage_generates_event():
    # Arrange
    entity = create_entity()
    events = []

    # Act
    entity.take_damage(5, events)

    # Assert
    assert len(events) == 1
    assert isinstance(events[0], DamageEvent)
    assert events[0].amount == 5
```

## Quality Standards (FIRST)

✅ **Fast**: Tests run in milliseconds
- Unit tests: < 10ms each
- Integration tests: < 1s each
- Full suite: < 30s total

✅ **Isolated**: No dependencies between tests
- Each test sets up its own data
- No shared mutable state
- Can run in any order
- Can run in parallel

✅ **Repeatable**: Same result every time
- No flaky tests
- No dependence on external state
- Deterministic randomness (seeded)
- No time-based logic without mocking

✅ **Self-Validating**: Clear pass/fail
- No manual inspection needed
- Assertions tell full story
- Clear error messages
- No console output checking

✅ **Timely**: Written with or before production code
- TDD: Write test first
- BDD: Write test for behavior
- Never skip tests
- Tests are documentation

## Running Tests

### Command Examples

```bash
# Run all tests
<test-command>

# Run specific category
<test-command> --filter="unit"
<test-command> tests/unit/

# Run single test file
<test-command> tests/unit/test_entity.py

# Run with coverage
<test-command> --coverage

# Run in watch mode
<test-command> --watch

# Run in parallel
<test-command> --parallel
```

### Pre-Commit Requirements

Before every commit:
```bash
# 1. Run type checker
<type-check-command>

# 2. Run all tests
<test-command>

# 3. Check coverage (optional)
<coverage-command>
```

All must pass with 100% success rate.

## Test Fixtures and Helpers

Create reusable test data:

```python
# test_helpers.py
def create_test_entity(
    health=10,
    attack=5,
    defense=2,
    position=(0, 0)
):
    """Create entity with sensible defaults for testing"""
    return Entity(
        health=health,
        attack=attack,
        defense=defense,
        position=position
    )

def create_test_game_state():
    """Create minimal game state for testing"""
    return GameState(
        entities=[],
        turn=1,
        seed=12345
    )
```

## Headless Testing (Games)

For game balance and simulation:

### Setup
```python
def test_wave_1_baseline():
    """Verify wave 1 is beatable with 3 towers"""
    # Arrange
    game = create_headless_game(seed=12345)
    game.place_tower(tower_id="basic", x=5, y=5)
    game.place_tower(tower_id="basic", x=10, y=5)
    game.place_tower(tower_id="basic", x=15, y=5)

    # Act
    result = game.run_wave(wave_number=1, max_ticks=10000)

    # Assert
    assert result.victory is True
    assert result.lives_lost <= 1
```

### Determinism Validation
```python
def test_deterministic_combat():
    """Same seed produces identical results"""
    wins = []

    for _ in range(10):
        game = create_headless_game(seed=12345)
        result = game.run_to_completion()
        wins.append(result.victory)

    assert all(w == wins[0] for w in wins)  # All same
```

### Balance Validation
```python
def test_win_rate_in_target_range():
    """Win rate should be 50-70% for balanced difficulty"""
    victories = 0
    num_runs = 100

    for seed in range(num_runs):
        game = create_headless_game(seed=seed)
        result = game.run_to_wave(target_wave=20)
        if result.victory:
            victories += 1

    win_rate = victories / num_runs
    assert 0.50 <= win_rate <= 0.70, f"Win rate {win_rate} outside target 50-70%"
```

## Common Testing Mistakes

### ❌ Don't Test Implementation Details
```python
# BAD - Testing how it works
def test_calculate_uses_addition():
    calc = Calculator()
    assert calc._internal_method() == 5  # Testing private details

# GOOD - Testing what it does
def test_calculate_with_valid_input_returns_correct_sum():
    calc = Calculator()
    assert calc.calculate(2, 3) == 5  # Testing public API
```

### ❌ Don't Write Huge Tests
```python
# BAD - Testing everything
def test_entire_game_system():
    # 200 lines of setup and assertions
    ...

# GOOD - One concept per test
def test_entity_takes_damage_reduces_health():
    # 10 lines, focused test
    ...
```

### ❌ Don't Use Random Data
```python
# BAD - Non-deterministic
def test_damage():
    damage = random.randint(1, 100)  # Different every run
    ...

# GOOD - Deterministic
def test_damage():
    damage = 50  # Same every run
    ...
```

### ❌ Don't Skip Assert Messages
```python
# BAD - Unclear failure
assert result > 0

# GOOD - Clear failure message
assert result > 0, f"Expected positive result, got {result}"
```

## Performance Testing

Validate performance characteristics:

```python
import time

def test_update_1000_entities_within_16ms():
    """Ensure 60 FPS possible with 1000 entities"""
    # Arrange
    entities = [create_entity() for _ in range(1000)]

    # Act
    start = time.perf_counter()
    for entity in entities:
        entity.update(0.016)
    elapsed = time.perf_counter() - start

    # Assert
    assert elapsed < 0.016, f"Update took {elapsed*1000:.2f}ms (target: 16ms)"
```

## Coverage Goals

**Minimum coverage:** 80% of core game logic
**Target coverage:** 90%+ of core game logic

**What to prioritize:**
- ✅ Game rules and logic (100%)
- ✅ Damage/combat calculations (100%)
- ✅ State transitions (100%)
- ❌ UI rendering code (not critical)
- ❌ Trivial getters/setters (low value)

## CI/CD Integration

Automated testing in CI:

```yaml
# Example: GitHub Actions
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup environment
        run: <setup-command>
      - name: Run type checking
        run: <type-check-command>
      - name: Run unit tests
        run: <test-command>
      - name: Upload coverage
        run: <coverage-upload-command>
```

---

## References

- **CLAUDE.md** - Project overview
- **ARCHITECTURE.md** - System design
- **COMMON_PITFALLS.md** - Common mistakes
