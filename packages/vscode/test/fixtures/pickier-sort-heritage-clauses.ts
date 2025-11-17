// Test fixture for pickier/sort-heritage-clauses rule
// Interface extends and class implements clauses should be sorted alphabetically

// ISSUE: Interface extends not sorted
interface UserProfile extends Zoomable, Clickable, Draggable {
  id: string
}

// ISSUE: Class implements not sorted
class MyComponent implements Zoomable, Clickable, Draggable {
  zoom() {}
  click() {}
  drag() {}
}

// ISSUE: Class extends and implements not sorted
class ExtendedComponent extends BaseComponent implements Validator, Formatter, Parser {
  validate() {}
  format() {}
  parse() {}
}

// ISSUE: Multiple interface extends
interface ComplexInterface extends Z, A, M, B {
  prop: string
}

// OK: Properly sorted (for comparison)
interface SortedInterface extends Clickable, Draggable, Zoomable {
  id: string
}

// Helper interfaces/classes for the fixture
interface Zoomable { zoom(): void }
interface Clickable { click(): void }
interface Draggable { drag(): void }
interface Validator { validate(): void }
interface Formatter { format(): void }
interface Parser { parse(): void }
class BaseComponent {}
