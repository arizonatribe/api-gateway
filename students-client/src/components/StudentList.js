/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, no-underscore-dangle, no-console */
import uuid from 'uuid';
import styled from 'styled-components';
import React, { Fragment, useState, useEffect } from 'react';
import SortAndPageButton from './SortAndPageButton';
import { Table, TableHeader, TableBody, TableFooter } from './Table';
import IconButton from './IconButton';
import AddEditModal from './AddEditModal';
import api from '../api';

const ActionButtons = styled.div`
  display: grid;
  background: transparent !important;
  grid-template-columns: repeat(2, auto);
  grid-column-gap: 0.3em;
  justify-items: center;
  align-content: center;
`;

function paginateFn(pageNumber = 0) {
  return (name, index) => (index >= 10 * (pageNumber - 1)) && (index < (10 * pageNumber));
}

function sortFn(key, order) {
  return (a, b) => {
    const fieldA = a[key].toUpperCase();
    const fieldB = b[key].toUpperCase();

    if (fieldA > fieldB) {
      return order === 'asc' ? 1 : -1;
    } if (fieldA < fieldB) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  };
}

function StudentList() {
  const [deleteId, setDeleteId] = useState('');
  const [editStudent, toggleEditStudent] = useState({});
  const [sortOption, sortStudents] = useState();
  const [allStudents, setStudents] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  function handleSort(sortBy) {
    let [sortField, sortOrder = 'asc'] = (sortOption || '').split(':');

    if (sortField === sortBy) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    sortField = sortBy || sortField;

    sortStudents([sortField, sortOrder].join(':'));

    setVisibleStudents(allStudents.sort(sortFn(sortField, sortOrder)).filter(paginateFn(currentPage)));
  }

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await api.get('/students');
      setStudents(data.students || []);
      setCurrentPage(1);
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    handleSort('name');
    setVisibleStudents(allStudents.filter(paginateFn(currentPage)));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [allStudents, currentPage]);

  useEffect(() => {
    async function deleteStudent() {
      const { data } = await api.delete(`/students/${deleteId}`);
      console.log(data);
      // await fetchStudents();
    }
    if (deleteId) {
      deleteStudent();
      setDeleteId('');
    }
  }, [deleteId]);

  function handleEditToggle(s) {
    if (s._id === editStudent.id) {
      toggleEditStudent({});
    } else {
      toggleEditStudent({ id: s._id, name: s.name, email: s.email });
    }
  }

  return (
    <Fragment>
      {editStudent.id && <AddEditModal {...editStudent} />}
      <Table>
        <TableHeader cols={3}>
          <SortAndPageButton onClick={() => handleSort('name')}>
            Name
          </SortAndPageButton>
          <SortAndPageButton onClick={() => handleSort('email')}>
            Email
          </SortAndPageButton>
          <SortAndPageButton>
            Actions
          </SortAndPageButton>
        </TableHeader>
        <TableBody cols={3}>
          {visibleStudents.map(s => (
            <div key={uuid()}>
              <p>{s.name}</p>
              <p>
                <a
                  href={`mailto:${s.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.email}
                </a>
              </p>
              <ActionButtons>
                <IconButton
                  width={25}
                  height={25}
                  iconName="edit"
                  onClick={() => handleEditToggle(s)}
                />
                <IconButton
                  width={25}
                  height={25}
                  iconName="trash"
                  onClick={() => setDeleteId(s._id)}
                />
              </ActionButtons>
            </div>
          ))}
        </TableBody>
        <TableFooter>
          <SortAndPageButton
            disabled={currentPage - 1 <= 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </SortAndPageButton>
          <SortAndPageButton
            disabled={(currentPage + 1) * 10 > allStudents.length}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </SortAndPageButton>
        </TableFooter>
      </Table>
    </Fragment>
  );
}

export default StudentList;
