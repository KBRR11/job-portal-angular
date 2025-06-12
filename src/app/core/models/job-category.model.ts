export interface JobCategoryResult {
    count:number;
    next:string| null
    previous:string | null
    results:JobCategory[]

}

export interface JobCategory {
  id: number;
  name: string;
  description: string;
  jobs_count?: number; // Optional, as it's a SerializerMethodField
  created_at: string;
}
