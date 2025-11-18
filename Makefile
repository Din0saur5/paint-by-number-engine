format:
	pipenv run black app tests

lint:
	pipenv run ruff check app tests

test:
	pipenv run pytest
