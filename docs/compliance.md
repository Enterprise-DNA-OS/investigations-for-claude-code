# Review checks and their limits

Sources checked 25 October 2026. These checks support a caseworker's record review. They do not certify compliance, authorise collection, establish admissibility or make findings about people. Use your jurisdiction's rules and an approved retention schedule.

| Check | Source | What the program checks | What a person must establish |
|---|---|---|---|
| IPP5 | [NZ Privacy Principle 5](https://www.privacy.org.nz/privacy-principles/5/) | A named case owner; database public access is denied by default | Reasonable security, authorised access, encrypted storage, backups and who may see each case |
| IPP9 | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Recorded purpose and a future retention-review date | Whether information is still required for a lawful purpose and any preservation or disposal requirements |
| CUSTODY | [Salesforce casework overview](https://help.salesforce.com/s/articleView?id=psc_casework_overview.htm&language=en_US&type=5) and the operator's evidence procedure | A custody receipt matching the current holder/location and a review date | Actual receipt, authority, handling history, storage integrity and admissibility |
| HOLD | Operator's recorded preservation instruction | A hold has a reason; returning evidence on a held case is blocked | The legal basis, scope and authorised release of the hold |

CUSTODY and HOLD are workflow checks, not statements of law. A review date is not an automatic disposal deadline. The seven-day work horizon and fourteen-day quiet-case interval are internal defaults, not statutory deadlines. No automatic deletion exists. Case closure preserves every record and does not lift a hold.

A reviewer supplies dates, purpose, actor name and evidence. The software cannot verify that a person is authorised merely because they type a name. All database use is by a trusted operator. There is no authentication service or per-case user permission system in the free base. Configure those for team deployment.

Original imports, notes, drafts and exported records can contain sensitive information. Keep them in approved storage and restrict access. RLS denies unprivileged database roles; owners and administrators retain access. Audit records are useful history, not tamper-proof evidence. Do not publish a report simply because it renders.
