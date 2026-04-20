enum elements {
    fire='fire',
    water='water',
    thunder='thunder',
    ice='ice',
    dragon='dragon',
    paralysis='paralysis',
    poison='poison',
    sleep='sleep',
    blast='blast'
}

const element_labels = {
    [elements.fire]: 'Fire',
    [elements.water]: 'Water',
    [elements.thunder]: 'Thunder',
    [elements.ice]: 'Ice',
    [elements.dragon]: 'Dragon',
    [elements.paralysis]: 'Paralysis',
    [elements.poison]: 'Poison',
    [elements.sleep]: 'Sleep',
    [elements.blast]: 'Blast'
} as const

export {elements, element_labels}