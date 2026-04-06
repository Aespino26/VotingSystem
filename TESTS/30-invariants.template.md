# Invariants

## Business Rules

### Authentication Invariants
- **INV-AUTH-001**: Each student ID must be unique in the system
- **INV-AUTH-002**: Admin usernames must be unique
- **INV-AUTH-003**: JWT tokens must expire after 24 hours
- **INV-AUTH-004**: Only authenticated users can access protected endpoints
- **INV-AUTH-005**: Admin role is required for admin-only operations

### Voting System Invariants
- **INV-VOTE-001**: Each student can vote exactly once per election
- **INV-VOTE-002**: Votes must be cast for valid, existing candidates
- **INV-VOTE-003**: Each position allows exactly one vote per student
- **INV-VOTE-004**: Votes cannot be changed or deleted after submission
- **INV-VOTE-005**: Vote timestamps must be recorded accurately

### Candidate Management Invariants
- **INV-CAND-001**: Each candidate must have a unique ID
- **INV-CAND-002**: Candidates must be associated with exactly one position
- **INV-CAND-003**: Candidate names must be non-empty and unique per position
- **INV-CAND-004**: Only admins can modify candidate information
- **INV-CAND-005**: Deleting a candidate removes all associated votes

### Data Integrity Invariants
- **INV-DATA-001**: All database transactions must be atomic
- **INV-DATA-002**: Foreign key relationships must be maintained
- **INV-DATA-003**: Vote counts must equal the sum of individual votes
- **INV-DATA-004**: User roles cannot be changed after creation
- **INV-DATA-005**: Audit logs must record all data modifications

### Security Invariants
- **INV-SEC-001**: All passwords must be hashed with bcrypt
- **INV-SEC-002**: User inputs must be validated and sanitized
- **INV-SEC-003**: SQL injection attacks must be prevented
- **INV-SEC-004**: HTTPS must be used for all communications
- **INV-SEC-005**: Session data must be stored securely

## System Constraints

### Performance Constraints
- **INV-PERF-001**: System must handle 1000 concurrent users
- **INV-PERF-002**: Database queries must complete within 100ms
- **INV-PERF-003**: Page loads must complete within 2 seconds
- **INV-PERF-004**: Vote submissions must be processed within 1 second

### Availability Constraints
- **INV-AVAIL-001**: System must maintain 99% uptime during elections
- **INV-AVAIL-002**: Database must be available 99.9% of the time
- **INV-AVAIL-003**: Automatic failover must work within 30 seconds
- **INV-AVAIL-004**: Backup restoration must complete within 4 hours

### Scalability Constraints
- **INV-SCALE-001**: System must scale horizontally with load balancers
- **INV-SCALE-002**: Database must support read replicas
- **INV-SCALE-003**: File storage must be cloud-based and scalable
- **INV-SCALE-004**: Caching layer must be implemented for performance

## State Invariants

### User State
- **INV-STATE-USER-001**: Users can be in states: registered, authenticated, voting, voted
- **INV-STATE-USER-002**: State transitions: registered → authenticated → voting → voted
- **INV-STATE-USER-003**: Once voted, users cannot return to voting state
- **INV-STATE-USER-004**: Admin users have persistent authenticated state

### Election State
- **INV-STATE-ELEC-001**: Elections can be in states: setup, active, closed, results
- **INV-STATE-ELEC-002**: Only admins can change election state
- **INV-STATE-ELEC-003**: Voting only allowed in 'active' state
- **INV-STATE-ELEC-004**: Results only visible in 'results' state

### Vote State
- **INV-STATE-VOTE-001**: Votes can be in states: pending, submitted, counted
- **INV-STATE-VOTE-002**: All submitted votes must eventually be counted
- **INV-STATE-VOTE-003**: Vote counts must be consistent across all positions
- **INV-STATE-VOTE-004**: Vote anonymity must be maintained

## Data Validation Rules

### Input Validation
- **INV-VALID-001**: Student IDs must match pattern: ^[A-Z]{2}\d{6}$
- **INV-VALID-002**: Email addresses must be valid format (if used)
- **INV-VALID-003**: Names must be 2-50 characters, alphanumeric + spaces
- **INV-VALID-004**: Descriptions must be 10-500 characters
- **INV-VALID-005**: Position names must be from predefined list

### Business Logic Validation
- **INV-LOGIC-001**: Cannot vote for non-existent candidates
- **INV-LOGIC-002**: Cannot vote multiple times for same position
- **INV-LOGIC-003**: Cannot modify votes after submission
- **INV-LOGIC-004**: Cannot delete candidates with existing votes
- **INV-LOGIC-005**: Results calculation must be deterministic

## Monitoring Invariants

### Logging Requirements
- **INV-MON-001**: All authentication attempts must be logged
- **INV-MON-002**: All vote submissions must be logged
- **INV-MON-003**: All admin actions must be logged
- **INV-MON-004**: System errors must be logged with stack traces
- **INV-MON-005**: Performance metrics must be collected

### Alerting Rules
- **INV-ALERT-001**: Alert when system CPU > 80%
- **INV-ALERT-002**: Alert when database connections > 90%
- **INV-ALERT-003**: Alert when response time > 2 seconds
- **INV-ALERT-004**: Alert when error rate > 5%
- **INV-ALERT-005**: Alert when disk space < 10%