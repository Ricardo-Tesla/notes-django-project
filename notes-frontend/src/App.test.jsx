import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import '@testing-library/jest-dom';

// Mock notes data
let mockNotes = [
  { id: 1, title: "Test Note", content: "Test Content" },
];

// Mock fetch globally before each test
beforeEach(() => {
  global.fetch = vi.fn((url, options) => {
    // GET notes
    if (!options || options.method === "GET") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNotes),
      });
    }

    // POST note
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      const newNote = { id: Date.now(), ...body };
      mockNotes.push(newNote);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(newNote),
      });
    }

    // PUT note
    if (options.method === "PUT") {
      const id = parseInt(url.split("/").slice(-2)[0]);
      const body = JSON.parse(options.body);
      const index = mockNotes.findIndex((n) => n.id === id);
      if (index !== -1) {
        mockNotes[index] = { id, ...body };
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockNotes[index]) });
      }
      return Promise.resolve({ ok: false });
    }

    // DELETE note
    if (options.method === "DELETE") {
      const id = parseInt(url.split("/").slice(-2)[0]);
      mockNotes = mockNotes.filter((n) => n.id !== id);
      return Promise.resolve({ ok: true });
    }

    return Promise.resolve({ ok: false });
  });
});

// Restore mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
  // Reset mockNotes to initial state
  mockNotes = [{ id: 1, title: "Test Note", content: "Test Content" }];
});

test("renders Notes heading", async () => {
  render(<App />);
  expect(await screen.findByText("Notes")).toBeInTheDocument();
});

test("user can create a note", async () => {
  render(<App />);
  await userEvent.type(screen.getByPlaceholderText("Title"), "New Note");
  await userEvent.type(screen.getByPlaceholderText("Content"), "New Content");
  await userEvent.click(screen.getByText("Add Note"));

  expect(await screen.findByText("New Note")).toBeInTheDocument();
  expect(await screen.findByText("New Content")).toBeInTheDocument();
});

test("user can edit a note", async () => {
  render(<App />);

  const editButton = await screen.findByText("Edit");
  await userEvent.click(editButton);

  const titleInput = screen.getByPlaceholderText("Title");
  const contentInput = screen.getByPlaceholderText("Content");

  await userEvent.clear(titleInput);
  await userEvent.type(titleInput, "Updated Note");
  await userEvent.clear(contentInput);
  await userEvent.type(contentInput, "Updated Content");

  await userEvent.click(screen.getByText("Update Note"));

  expect(await screen.findByText("Updated Note")).toBeInTheDocument();
  expect(await screen.findByText("Updated Content")).toBeInTheDocument();
});

test("user can delete a note", async () => {
  render(<App />);

  const noteTitle = await screen.findByText("Test Note");
  const noteCard = noteTitle.closest("div");
  const deleteButton = noteCard.querySelector("button:last-child");

  // Automatically confirm deletion
  window.confirm = vi.fn(() => true);

  await userEvent.click(deleteButton);

  await waitFor(() => {
    expect(screen.queryByText("Test Note")).not.toBeInTheDocument();
  });
});

test("shows error when fetch fails", async () => {
  // Force fetch to fail
  global.fetch = vi.fn(() => Promise.reject("API error"));

  render(<App />);
  expect(await screen.findByText("Failed to fetch notes")).toBeInTheDocument();
});
