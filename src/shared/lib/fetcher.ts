
import { /* z, */ ZodSchema } from 'zod';



export async function fetcher<T>(url: string, schema: ZodSchema<T>): Promise<T> {

    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  
    const json = await response.json();
  
    const parsed = schema.safeParse(json);
  
    if (parsed.success) {
      return parsed.data;
    }
  
    console.error(parsed.error);
    throw new Error('Data validation error');
  }