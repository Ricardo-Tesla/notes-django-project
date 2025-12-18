# Testing api endpoints
# This is real integration testing(API + DB)

import pytest
from rest_framework.test import APIClient
from notes.models import Note



@pytest.mark.django_db
def test_create_note_api():
    client = APIClient()

    response = client.post(
        "/api/notes/",
        {"title": "API Note", "content": "From API"},
        format="json"
    )

    assert response.status_code == 201
    assert response.data["title"] == "API Note"


@pytest.mark.django_db
def test_get_notes_api():
    Note.objects.create(title="Note 1", content="Content 1")

    client = APIClient()
    response = client.get("/api/notes/")

    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Note 1"


@pytest.mark.django_db
def test_update_note_api():
    note = Note.objects.create(title="Old", content="Old content")

    client = APIClient()
    response = client.put(
        f"/api/notes/{note.id}/",
        {"title": "New", "content": "New content"},
        format="json"
    )

    assert response.status_code == 200
    assert response.data["title"] == "New"


@pytest.mark.django_db
def test_delete_note_api():
    note = Note.objects.create(title="Delete", content="Me")

    client = APIClient()
    response = client.delete(f"/api/notes/{note.id}/")

    assert response.status_code == 204
    assert Note.objects.count() == 0

@pytest.mark.django_db
def test_create_note_missing_fields():
    client = APIClient()

    response = client.post(
        "/api/notes/",
        {"title": ""},
        format="json"
    )

    assert response.status_code == 400
    assert "content" in response.data or "title" in response.data

@pytest.mark.django_db
def test_update_nonexistent_note():
    client = APIClient()

    response = client.put(
        "/api/notes/9999/",
        {"title": "Nope", "content": "Nope"},
        format="json"
    )

    assert response.status_code == 404
@pytest.mark.django_db
def test_delete_nonexistent_note():
    client = APIClient()

    response = client.delete("/api/notes/9999/")

    assert response.status_code == 404
@pytest.mark.django_db
def test_patch_not_allowed():
    client = APIClient()

    response = client.patch("/api/notes/")

    assert response.status_code == 405
