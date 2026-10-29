# Writing guidelines

Rules for the text of every Nethesis user interface. Use them together with the [glossary](?page=glossary). Where a rule comes from a [vue-components pattern](https://nethesis.github.io/vue-components/), use that pattern instead of rebuilding it.

The text should help users understand what is happening, identify the affected item, know what they can or must do next, and recognize the same patterns across products.

## Principles

- **Be clear and specific.** Use plain language and name the affected item, state or action. Keep the text short without removing what users need.
- **Write from the user's perspective.** Say what users need to know, not what the system did internally.
- **Be consistent.** Use the same term for the same concept in labels, titles, descriptions and actions: see the [glossary](?page=glossary).
- **Guide users when they can act.** When users can solve a problem or continue a task, say what to do next. Never suggest an action that is not available.
- **Explain consequences.** Before a destructive or irreversible action, say what will be affected and whether it can be undone.

| Do | Don't |
| --- | --- |
| User Alice Fox has been created | Operation completed successfully |

## Voice and tone

Be clear, direct and calm. Say what happened and what users can do. Don't joke, and avoid jargon when a plain word exists.

- **Address users directly.** Use *you* and *your* when it makes an instruction clearer. Don't write "the user" in instructions.
- **Don't blame users.** Focus on the correction, not on what users did wrong.
- **No unnecessary politeness or enthusiasm.** Don't use "please" for routine instructions, and don't celebrate routine results.
- **No questions in titles.** Use a question only when the interface really asks users to decide.

| Do | Don't |
| --- | --- |
| Enter your password | The user must enter a password |
| Enter a valid IP address | You entered an invalid value |
| Enter your password | Please enter your password |
| User created | Great! The operation was completed successfully! |
| Delete user | Are you sure you want to delete this user? |
| Cannot connect to the leader node | Oops! Something bad happened |
| You don't have permission to view this page | Access denied: insufficient privileges |

## Capitalization

Use sentence case everywhere: page titles, buttons, labels, tabs, menu items, table headers. Capitalize only the first word and proper nouns. Keep the official capitalization of products, protocols, acronyms and technical identifiers.

| Do | Don't |
| --- | --- |
| Change password | Change Password |
| Worker node | Worker Node |

When a sentence names a specific page, menu item or tab, write it exactly as it appears in the user interface. When the same word is used as a common noun, write it in lowercase.

| Do | Don't |
| --- | --- |
| Go to Dashboard | Go to dashboard |
| The dashboard shows the cluster status | The Dashboard shows the cluster status |

## Punctuation

- End full sentences with a period in descriptions, helper text and body text.
- Don't use a period in titles, labels, buttons, tabs, badges, placeholders, table cells, tooltips and short inline validation messages.
- In toast notifications, omit the final period when the description is one short sentence. Use normal punctuation when it has more sentences.
- Don't end labels with a colon.
- Use the ellipsis character `…`, not three dots. Use it only for text that is in progress (`Loading…`).
- Use straight quotes around names the user must type: `Type 'Alice Fox' to confirm`. Don't put quotes around object names elsewhere.

## Style

- **Prefer active voice** for instructions and actions. Passive voice is fine when the affected object matters more than who acted: `User Alice Fox has been created.`
- **Name the affected item when it helps.** Keep titles short and reusable, and put the name in the description. Don't repeat the name when the context already makes the item clear.
- **Limit technical language** to what users need to understand or solve the problem. Explain a term on first use when the audience may not know it. Don't show implementation details, error codes or raw server messages as the main message.

## Titles and descriptions

Titles:

- Keep them short and scannable. Say the state, result, problem or action.
- Include the type of the affected item when it makes the message clearer.
- Don't repeat what the surrounding context already shows, and don't use a generic title when the task or state is known.
- Use an action for dialogs (`Delete user`) and a result or state for notifications (`User created`).

Descriptions:

- Add what the title doesn't say: the affected item, the cause (only when it is known and reliable), the consequences, what to do next.
- Give instructions only when users can follow them.
- Keep one main idea per sentence. Use more sentences when the cause, the consequence and the fix all need explaining.

## Buttons and actions

Start with a verb and name the object when the context is not obvious. Keep labels short, usually one to three words. The confirmation button repeats the verb of the title.

| Do | Don't |
| --- | --- |
| Create user | New, OK, Yes |
| Delete | Confirm |
| Save changes | Submit, Proceed |

Use the [glossary](?page=glossary) verbs: **Create** a new object, **Add** an existing one, **Edit**, **Delete** to destroy, **Remove** from a list, **Uninstall** an application.

Recurring actions:

- **Cancel** abandons an unfinished action. **Close** dismisses information with no pending changes.
- **Back** returns to the previous page or view. **Previous** and **Next** move between the steps of a wizard.
- At the end of a flow, name the final action (`Install`, `Configure`, `Create`, `Save`) instead of `Done`.

For links and buttons that take the user somewhere else:

- **Go to** `<page>` navigates to another page of the same product: `Go to Dashboard`, `Go to Settings`.
- **Open** `<site>` opens an external website in a new tab: `Open Wikipedia`.

| Do | Don't |
| --- | --- |
| Go to Settings | Open Settings |
| Open Wikipedia | Go to Wikipedia |

Exception for brevity: in a table row or a card, the button that opens the page of the object is `Details` (`Dettagli`), with the eye icon. Add the object name for screen readers, after the visible label: "Details Alice Fox". Use `Show details` only for content that opens in place.

| Do | Don't |
| --- | --- |
| Details | View, See details, View details |

Icon buttons need a tooltip, and screen readers read the same text. Describe the action, not the icon: a short verb phrase, naming the item when the context doesn't, with no final period.

| Do | Don't |
| --- | --- |
| Delete user | Trash |
| Copy phone number | Click here |

## Forms

From the [*New password form* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-new-password-form--standard).

- **Labels** are nouns that name the information or setting, not the way to enter it: `Username`, `Language`, `Admin password`. Use the same terms as the table columns and the detail views. A label can be a short instruction when a noun would be unclear, as in `Confirm new password`.
- **Helper text** says why the information is needed, how it is used or which format is expected. Don't repeat the label, and show the requirements before an error happens. Keep it true both when the field is empty and when it is filled.
- **Placeholders** show an example or the expected format (`e.g. name@example.com`), or say briefly what to do (`Filter users`). Never use a placeholder instead of a label, and don't repeat the label.
- **Validation messages** say what is wrong and, when useful, how to fix it. Prefer an instruction (`Enter a valid email address`); when no instruction fits, state the problem neutrally (`Passwords do not match`). Don't blame users, and don't use `Invalid value` when the requirement is known.
- Mark optional fields, not required ones. When a required field is empty, say `Required`, or give a positive instruction that names what is missing: `Enter a username`, `Select a language`, `Enter an integer number`.

Validation messages:

| Do | Don't |
| --- | --- |
| Enter a valid email address | Email address is not valid |
| Password must contain at least 8 characters | Invalid value |
| Passwords do not match | You entered two different passwords |

## Page header

From the [*Table page* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-table-page--standard).

- Title: the plural object (`Phonebook contacts`).
- Description: one sentence that says what the page shows or is for. For a list, a good pattern is `List of <objects>, including <main attributes>.`
- Primary action on the right: `Create <object>`.
- Text filter placeholder: `Filter <objects>`.

## Table filters

From the [*Table page* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-table-page--standard) and My Nethesis. A table can have a text filter and some dropdown filters. A filter can have a default value: for example, a status filter that shows only the active users when the page opens.

- **Reset** brings filters back to their default values. Use it in every case except the one below, even when all the defaults are empty.
- **Clear** empties a selection. Use it only inside a single dropdown filter that has nothing selected by default: there, resetting means emptying, and "Clear" says it better.

| Applies to | Label | Italian |
| --- | --- | --- |
| All the filters of a table, from the toolbar or the empty state | Reset filters | Reimposta filtri |
| One dropdown filter that has a default selection | Reset selection | Reimposta selezione |
| One dropdown filter that has nothing selected by default | Clear selection | Azzera selezione |
| The clear button of the text filter (screen readers only) | Clear search | Azzera ricerca |

The label of a dropdown filter names the data category, with a noun and the same term used in the table. Keep its options parallel in grammar and level of detail.

| Do | Don't |
| --- | --- |
| Reset filters | Clear filters |
| Reset selection, for a status filter with a default | Clear selection |
| Company | Filter by company |
| Status | Select status |

## Empty states

From the [*Empty state* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-empty-state--no-items). Pick the case that matches the situation.

| Case | Title | Description | Action |
| --- | --- | --- | --- |
| Nothing created yet | No users configured | (Optional) | Create user |
| Nothing to show, nothing to create | No voicemail messages | You currently have no voicemail messages. | none |
| Items will appear over time | No notifications yet | (Optional) | none |
| Filters match nothing | No users found | Try changing your search filters. | Reset filters |
| Feature turned off | Threat Shield DNS is disabled | Say how to enable it, if users can. | The action that enables it, if any |
| No permission | Restricted page | It seems that you don't have the necessary permissions to view this page. | Go to Dashboard |

- Title: the state, not the component, with the plural of the object. No instructions in the title.
- Description: the reason or the next step, without repeating the title. It can stay informative when there is nothing to do.
- Action: a short verb phrase, only when there is a meaningful next step.

## Modals

From the [*Delete item modal* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-delete-item-modal--standard).

- Title: an action for decisions and tasks (`Delete user`, `Perform factory reset`), a noun for information (`Connection details`). No questions, consequences or instructions in the title.
- Description: what the title doesn't say. Name the affected item, explain the consequences of destructive actions and say whether they can be undone.
- Buttons: the main button repeats the verb of the title (`Delete user` → `Delete`, `Perform factory reset` → `Reset`). Add `Cancel` when there is an unfinished action to abandon. A modal that only informs has a single `Close` button.

| Do | Don't |
| --- | --- |
| Delete user | Are you sure? |
| Download configuration | Confirm action |
| Connection details | Important information |

### Delete confirmation

- Title: `Delete <object type>`.
- Description: name the object and say what happens: `User Alice Fox will be permanently deleted.` Add the side effects, if any: `Their personal files will be deleted too.`
- Buttons: `Delete` (danger) and `Cancel`.
- When deletion has consequences beyond the object itself, for example it destroys data, removes many objects or breaks something that depends on it, ask the user to type the name: `Type 'Alice Fox' to confirm`. Don't ask it for routine deletions.

## Notifications

### Error messages

From the [*Inline error notification* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-inline-error-notification--network-error).

- Title: `Cannot <verb> <object>`, for example `Cannot save phonebook contact`. Keep it specific even when the cause is unknown.
- Description: the cause and what to do: `Network error. Check your connection and reload the page.`
- Use `Something went wrong.` as description only when the cause is really unknown.

### Success notifications

From the [*Success toast notification* pattern](https://nethesis.github.io/vue-components/?path=/story/patterns-success-toast-notification--item-created).

- Title: say concisely what happened, in the past tense, without names or articles. For changes to an object, a good pattern is `<Object> created`, `<Object> updated`, `<Object> deleted`.
- Description: add the details the title leaves out, such as which object or what happens next. For changes to an object, a good pattern is `<Object type> <name> has been created`.
- For several objects without a name: `Voicemail has been enabled for the selected users`. When the number matters: `8 users have been imported from the CSV file`.
- Don't show a toast for actions whose result is already visible on the page.

### Inline notifications

Keep the title on one line and the description to one sentence. Say clearly what to do when the notification reports a problem or a required step.

## Numbers, dates and units

- Format numbers and dates for the user's language.
- Put a space between a number and its unit: `10 GB`, `30 s`.
- Use the 24-hour clock in Italian.

## Italian translation

- Use the informal imperative (*tu*): `Inserisci`, `Seleziona`, `Controlla`. Don't use the infinitive (`Inserire`) or the formal form (`Inserisca`).
- Keep the English capitalization: sentence case. Write the name of a page, menu item or tab exactly as its Italian label: `Vai alla Dashboard`, `Vai alle Impostazioni`. Translate **Go to** as *Vai a* and **Open** as *Apri*.
- Don't translate the terms marked *Keep in English* in the [glossary](?page=glossary). Translate everything else, including `Download` (`Scarica`) and `Upload` (`Carica`).
- For notifications about an object, use the definite article: `L'utente <name> è stato creato`, `La regola <name> è stata eliminata`.
- Patterns to reuse:

| English | Italian |
| --- | --- |
| Cannot save phonebook contact | Impossibile salvare il contatto della rubrica |
| User created | Utente creato |
| User Alice Fox has been created | L'utente Alice Fox è stato creato |
| User Alice Fox will be deleted. | L'utente Alice Fox verrà eliminato. |
| Type 'Alice Fox' to confirm | Digita 'Alice Fox' per confermare |
| No users found | Nessun utente trovato |
| Try changing your search filters. | Prova a modificare i filtri di ricerca. |
| Go to Dashboard | Vai alla Dashboard |
| Open Wikipedia | Apri Wikipedia |
| Cancel | Annulla |
