import React from 'react';
import { DescriptionList } from 'components/DescriptionList';

export default {
  title: 'components/DescriptionList',
  component: DescriptionList,
};

export const List = () => (
  <>
    <DescriptionList orientation="horizontal">
      <dt>Beast of Bodmin</dt>
      <dd>A large feline inhabiting Bodmin Moor.</dd>

      <dt>Morgawr</dt>
      <dd>A sea serpent.</dd>

      <dt>Owlman</dt>
      <dd>A giant owl-like creature.</dd>
    </DescriptionList>
    <DescriptionList orientation="vertical">
      <dt>Beast of Bodmin</dt>
      <dd>A large feline inhabiting Bodmin Moor.</dd>

      <dt>Morgawr</dt>
      <dd>A sea serpent.</dd>

      <dt>Owlman</dt>
      <dd>A giant owl-like creature.</dd>

      <dt>first term</dt>
      <dt>second term</dt>
      <dd>Both of those terms are defined here</dd>
    </DescriptionList>
  </>
);
