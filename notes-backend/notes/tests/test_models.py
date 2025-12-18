# Testing if the database write works
# Model fields behave correctly


import pytest
from notes.models import Note

@pytest.mark.django_db
def test_note_creation():
    note = Note.objects.create(
        title="Test Title",
        content="Test Content"
    )

    assert note.id is not None
    assert note.title == "Test Title"
    assert note.content == "Test Content"
