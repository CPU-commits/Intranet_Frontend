import type { FormType } from "$models/classroom/form.model";
import type { Work, WorkBuild } from "$models/classroom/work.model";
import type { Author } from "$models/library/author.model";
import type { Book } from "$models/library/book.model";
import { intToRoman } from "./format";

export function validateForm(form: FormType) {
    if (form.title.length === 0 || form.title.length > 100)
			throw new Error('El titlo del formulario debe ser de máx. 100 cárac.')
		if (String(form.has_points) === '') throw new Error('Debe seleccionar un puntaje (preguntas)')
		if (form.items.length === 0) throw new Error('Debe haber mín. 1 item')
		form.items.forEach((item, i) => {
			if (item.title.length === 0 || item.title.length > 100)
				throw new Error(
					`El titulo del item ${intToRoman(i + 1)} debe ser de máx. 100 cárac.`,
				)
			if (String(form.has_points) === 'true' && (item.points_type === '' || item.points_type === 'without'))
				throw new Error(
					`Debe seleccionar una asignación de puntaje en el item ${intToRoman(i + 1)}`,
				)
			if (
				item.points_type === 'equal' &&
				(Number(item.points) <= 0 || !item.points) &&
				String(form.has_points) === 'true'
			)
				throw new Error(
					`Debe indicar un puntaje total a distribuir mayor a 0 en el item ${intToRoman(
						i + 1,
					)}`,
				)
			if (item.questions.length === 0)
				throw new Error(`Debe haber mín. 1 pregunta en el item ${intToRoman(i + 1)}`)
			item.questions.forEach((question, iQ) => {
				if (question.type === '')
					throw new Error(
						`Debe seleccionar tipo de pregunta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (question.question)
					throw new Error(
						`Debe escribir una pregunta en la pregunta ${iQ + 1} del item ${intToRoman(
							i + 1,
						)}`,
					)
				if (
					item.points_type === 'custom' &&
					String(form.has_points) === 'true' &&
					Number(question.points) <= 0 &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser mayor a 0 en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (
					item.points_type === 'custom' &&
					String(form.has_points) === 'true' &&
					!Number.isInteger(Number(question.points)) &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser entero en la pregunta ${iQ + 1} del item ${intToRoman(
							i + 1,
						)}`,
					)
				if (question.type.includes('alternatives') && question.answers.length <= 1)
					throw new Error(
						`Deben existir mín. 2 alternativas en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				question.answers.forEach((answer, iA) => {
					if (answer.length === 0 || answer.length > 100)
						throw new Error(
							`La respuesta ${iA + 1} debe ser de máx. 100 cárac. de la pregunta ${
								iQ + 1
							} del item ${intToRoman(i + 1)}`,
						)
				})
				if (
					question.type === 'alternatives_correct' &&
					question.correct >= question.answers.length
				)
					throw new Error(
						`Debe existir una respuesta correcta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
			})
			if (item.points_type === 'equal' && String(form.has_points) === 'true') {
				const countQuestions = item.questions.reduce((a, b) => {
					const count = b.type !== 'alternatives' ? 1 : 0
					return a + count
				}, 0)
				const pointsPerQuestion = Number(item.points) / countQuestions
				if (!Number.isInteger(pointsPerQuestion))
					throw new Error(
						`El puntaje equitativo para cada pregunta del item ${intToRoman(
							i + 1,
						)} no es entero. (Resulta ${pointsPerQuestion})`,
					)
			}
		})
}

export function validateWork(work: WorkBuild) {
    if (work.title === '' || work.title.length > 100)
        throw new Error('El titlo del trabajo debe ser de máx. 100 cárac.')
    if (work.description.length > 150)
        throw new Error('La descripción del trabajo debe ser de máx. 150 cárac.')
    if (work.is_qualified === '')
        throw new Error('Debe seleccionar una calificación de trabajo')
    if (work.is_qualified === 'true' && work.grade === '')
        throw new Error('Debe seleccionar una calificación asignada')
    if (work.type === '')
        throw new Error('Debe seleccionar un tipo de trabajo')
    if (work.type === 'form' && work.form === '')
        throw new Error('Debe seleccionar un formulario asignado')
    if (work.type === 'files') {
        if (work.pattern.length === 0)
            throw new Error('La pauta debe tener mín. 1 item')
        work.pattern.forEach((item, i) => {
            if (item.title === '' || item.title.length > 100)
                throw new Error(`El titulo ${i+1} de la pauta debe ser de máx. 100 cárac.`)
            if (item.description === '' || item.description.length > 300)
                throw new Error(`La descripción ${i+1} de la pauta debe ser de máx. 300 cárac.`)
            if (Number(item.points) < 0 || !Number.isInteger(Number(item.points)))
                throw new Error(`El puntaje ${i+1} de la pauta debe ser entero y mayor a cero`)
        })
    }
    if (work.date_start === '')
        throw new Error('Debe indicar una fecha inicio de acceso')
    if (work.time_start === '')
        throw new Error('Debe indicar un tiempo inicio de acceso')
    if (work.date_limit === '')
        throw new Error('Debe indicar una fecha límite de acceso')
    if (work.time_limit === '')
        throw new Error('Debe indicar un tiempo límite de acceso')
    if (work.type === 'form' && work.time_access === '' && work.form_access === 'wtime')
        throw new Error('Debe indicar un tiempo límite de acceso al formulario')
}

export function validateWorkEdit(
    work: Work,
    dates: {
        start_date: string
        start_hour: string
        limit_date: string
        limit_hour: string
    },
    timeAccess: string,
) {
    if (work.title === '' || work.title.length > 100)
        throw new Error('El titlo del trabajo debe ser de máx. 100 cárac.')
    if (work.description.length > 150)
        throw new Error('La descripción del trabajo debe ser de máx. 150 cárac.')
    if (work.is_qualified && work.grade._id === '')
        throw new Error('Debe seleccionar una calificación asignada')
    if (work.type === 'form' && work.form === '')
        throw new Error('Debe seleccionar un formulario asignado')
    if (work.type === 'files') {
        if (work.pattern.length === 0)
            throw new Error('La pauta debe tener mín. 1 item')
        work.pattern.forEach((item, i) => {
            if (item.title === '' || item.title.length > 100)
                throw new Error(`El titulo ${i+1} de la pauta debe ser de máx. 100 cárac.`)
            if (item.description === '' || item.description.length > 300)
                throw new Error(`La descripción ${i+1} de la pauta debe ser de máx. 300 cárac.`)
            if (Number(item.points) < 0 || !Number.isInteger(Number(item.points)))
                throw new Error(`El puntaje ${i+1} de la pauta debe ser entero y mayor a cero`)
        })
    }
    if (dates.start_date === '')
        throw new Error('Debe indicar una fecha inicio de acceso')
    if (dates.start_hour === '')
        throw new Error('Debe indicar un tiempo inicio de acceso')
    if (dates.limit_date === '')
        throw new Error('Debe indicar una fecha límite de acceso')
    if (dates.limit_hour === '')
        throw new Error('Debe indicar un tiempo límite de acceso')
    if (work.type === 'form' && timeAccess === '' && work.form_access === 'wtime')
        throw new Error('Debe indicar un tiempo límite de acceso al formulario')
}

export function validateAuthor(author: Author) {
    if (author.name === '' || author.name.length > 200)
        throw new Error('Debe existir un nombre de autor de máx. 200 cárac.')
    if (author.biography === '' || author.biography.length > 1500)
        throw new Error('Debe existir una biografía de máx. 1500 cárac.')
    if (author.table_info.length === 0)
        throw new Error('La tabla de información no puede estar vacía')
    author.table_info.forEach((item, i) => {
        if (item.key === '' || item.key.length > 50)
            throw new Error(`Debe existir un titulo para la tabla de información ${i+1} de máx. 50 cárac.`)
        if (item.value === '' || item.value.length > 100)
            throw new Error(`Debe existir un valor para la tabla de información ${i+1} de máx. 100 cárac.`)
    })
    if (author.fun_facts.length === 0)
        throw new Error('La sección de datos curiosos no puede estar vacía')
    author.fun_facts.forEach((fact, i) => {
        if (fact.title === '' || fact.title.length > 100)
            throw new Error(`Debe existir un titulo para los datos curiosos ${i+1} de máx. 100 cárac.`)
        if (fact.fact === '' || fact.fact.length > 500)
            throw new Error(`Debe existir un dato curioso para los datos curiosos ${i+1} de máx. 500 cárac.`)
    })
    author.references.forEach((reference, i) => {
        if (reference === '')
            throw new Error(`La referencia ${i+1} no puede estar vacía`)
    })
}

export function validateBook(book: Book) {
    if (book.name === '' || book.name.length > 150)
        throw new Error('Debe existir un nombre de libro de máx. 150 cárac.')
    if (book.synopsis === '' || book.synopsis.length > 500)
        throw new Error('Debe existir una sinopsis de máx. 150 cárac.')
    if (book.tags.length === 0)
        throw new Error('Tiene que seleccionar al menos una categoria')
    if (book.author === '')
        throw new Error('Tiene que seleccionar un autor')
    if (book.editorial === '')
        throw new Error('Tiene que seleccionar una editorial')
}
