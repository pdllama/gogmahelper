

const statuses = ['blast', 'paralysis', 'poison', 'sleep']

export default function sort_preferences(list_of_preferences:any[]) { // must have weapon and element key
    return list_of_preferences.sort((a:any, b:any) => {
        return a.weapon == null ? -1 :
                a.element == null ? 
                    b.weapon == null ? 1 : -1 :
                !a.element.in(statuses) ?
                    (b.weapon == null || b.element == null) ? 1 : -1 :
                1 
    })
    // -1 -> a goes before b.
    //  1 -> a goes after b.
    // 1. Any preferences.
    // 2. weapon specific preferences
    // 3. weapon/element specific preferences with the element as non-status
    // 4. weapon/element specific preferences with the element as status
}