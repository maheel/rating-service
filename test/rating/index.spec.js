import { createTest } from './createRating';
import { updateTest } from './updateRating';
import { deleteTest } from './deleteRating';
import { getRatingByContentTest } from './getRatingByContent';

describe('rating', function () {
  describe('createRating', createTest);
  describe('updateRating', updateTest);
  describe('deleteRating', deleteTest);
  describe('getRatingByContent', getRatingByContentTest);
});
