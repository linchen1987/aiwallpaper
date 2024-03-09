import { QueryResult, QueryResultRow } from "pg";

import { Poetry } from "@/types/poetry";
import { getDb } from "./db";

export async function insertPoetry(poetry: Poetry) {
  const db = getDb();
  const res = await db.query(
    `INSERT INTO poetries
        (user_email, poetry_description, poetry_text, llm_name, llm_params, created_at) 
        VALUES 
        ($1, $2, $3, $4, $5, $6)
    `,
    [
      poetry.user_email,
      poetry.poetry_description,
      poetry.poetry_text,
      poetry.llm_name,
      poetry.llm_params,
      poetry.created_at,
    ]
  );

  return res;
}

export async function getPoetriesCount(): Promise<number> {
  const db = getDb();
  const res = await db.query(`SELECT count(1) as count FROM poetries`);
  if (res.rowCount === 0) {
    return 0;
  }

  const { rows } = res;
  const row = rows[0];

  return row.count;
}

export async function getUserPoetriesCount(
  user_email: string
): Promise<number> {
  const db = getDb();
  const res = await db.query(
    `SELECT count(1) as count FROM poetries WHERE user_email = $1`,
    [user_email]
  );
  if (res.rowCount === 0) {
    return 0;
  }

  const { rows } = res;
  const row = rows[0];

  return row.count;
}

export async function getPoetries(
  page: number,
  limit: number
): Promise<Poetry[] | undefined> {
  if (page < 1) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 50;
  }
  const offset = (page - 1) * limit;

  const db = getDb();
  const res = await db.query(
    `select w.*, u.email as user_email, u.nickname as user_name, u.avatar_url as user_avatar from poetries as w left join users as u on w.user_email = u.email order by w.created_at desc limit $1 offset $2`,
    [limit, offset]
  );
  if (res.rowCount === 0) {
    return undefined;
  }

  const wallpapers = getPoetriesFromSqlResult(res);

  return wallpapers;
}

export function getPoetriesFromSqlResult(
  res: QueryResult<QueryResultRow>
): Poetry[] {
  if (!res.rowCount || res.rowCount === 0) {
    return [];
  }

  const wallpapers: Poetry[] = [];
  const { rows } = res;
  rows.forEach((row) => {
    const wallpaper = formatPoetry(row);
    if (wallpaper) {
      wallpapers.push(wallpaper);
    }
  });

  return wallpapers;
}

export function formatPoetry(row: QueryResultRow): Poetry | undefined {
  let poetry: Poetry = {
    id: row.id,
    user_email: row.user_email,
    poetry_description: row.poetry_description,
    poetry_text: row.poetry_text,
    llm_name: row.llm_name,
    llm_params: row.llm_params,
    created_at: row.created_at,
  };

  if (row.user_name || row.user_avatar) {
    poetry.created_user = {
      email: row.user_email,
      nickname: row.user_name,
      avatar_url: row.user_avatar,
    };
  }

  try {
    poetry.llm_params = JSON.parse(JSON.stringify(poetry.llm_params));
  } catch (e) {
    console.log("parse poetry llm_params failed: ", e);
  }

  return poetry;
}
