import { User } from "./user";

export interface Poetry {
  id?: number;
  user_email: string;
  poetry_description: string;
  poetry_text: string;
  llm_name: string;
  llm_params?: any;
  created_at: string;
  created_user?: User;
}
