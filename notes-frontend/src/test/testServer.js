import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";


let notes = [
  { id: 1, title: "Test Note", content: "Test Content" },
];

export const server = setupServer(
  http.get("http://localhost:8000/api/notes/", () => {
    return HttpResponse.json(notes);
  }),

  http.post("http://localhost:8000/api/notes/", async ({ request }) => {
    const body = await request.json();
    const newNote = { id: Date.now(), ...body };
    notes.push(newNote);
    return HttpResponse.json(newNote, { status: 201 });
  }),

  http.delete("http://localhost:8000/api/notes/:id/", ({ params }) => {
    notes = notes.filter(n => n.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  })
);
