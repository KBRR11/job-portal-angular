export interface SkillsResult {
    count:number
    next:string | null
    previous: string | null
    results: Skill[]
}

export interface Skill {
    id: number;
    name: string;
    description: string;
}
